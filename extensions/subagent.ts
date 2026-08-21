/**
 * subagent.ts — delegate tasks to specialized agents (isolated context)
 *
 * Discovers agent definitions in <cwd>/agents/*.md (markdown with YAML
 * frontmatter: name, description, tools, model) and runs them as separate
 * `pi -p` subprocesses with the agent's body as an appended system prompt.
 *
 * Modes:
 *   { agent, task }        single delegation
 *   { tasks: [{agent, task}] }  parallel delegation (max 6, 3 concurrent)
 *   {}                     list available agents
 *
 * Simplified from pi's official examples/extensions/subagent.
 */

import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";

const MAX_PARALLEL_TASKS = 6;
const MAX_CONCURRENCY = 3;
const OUTPUT_CAP = 50 * 1024;

/**
 * Resolve the agents directory:
 *   1. <cwd>/agents        (project-local agent definitions win)
 *   2. <package>/agents    (agents bundled with this extension)
 */
function resolveAgentsDir(cwd: string): string {
	const local = path.join(cwd, "agents");
	if (fs.existsSync(local)) return local;
	try {
		// jiti shims import.meta.url to this file's real path
		const here = path.dirname(fileURLToPath(import.meta.url));
		const bundled = path.resolve(here, "..", "agents");
		if (fs.existsSync(bundled)) return bundled;
	} catch {
		// import.meta unavailable — keep cwd fallback
	}
	return local;
}

interface AgentConfig {
	name: string;
	description: string;
	tools?: string[];
	model?: string;
	systemPrompt: string;
	filePath: string;
}

/** Minimal frontmatter parser for simple scalar/list YAML (name, tools, ...). */
function parseAgentFile(content: string, filePath: string): AgentConfig | null {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
	if (!match) return null;

	const frontmatterText = match[1];
	const body = match[2];

	const front: Record<string, string | string[]> = {};
	for (const line of frontmatterText.split(/\r?\n/)) {
		const kv = /^([a-zA-Z_-]+)\s*:\s*(.*)$/.exec(line);
		if (!kv) continue;
		const [, key, rawValue] = kv;
		const value = rawValue.trim().replace(/^["']|["']$/g, "");
		if (value.startsWith("[") && value.endsWith("]")) {
			front[key] = value
				.slice(1, -1)
				.split(",")
				.map((s) => s.trim().replace(/^["']|["']$/g, ""))
				.filter(Boolean);
		} else {
			front[key] = value;
		}
	}

	const name = front.name;
	const description = front.description;
	if (typeof name !== "string" || !name || typeof description !== "string" || !description) return null;

	const toolsRaw = front.tools;
	const tools = Array.isArray(toolsRaw)
		? toolsRaw
		: typeof toolsRaw === "string" && toolsRaw
			? toolsRaw
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: undefined;

	return {
		name,
		description,
		tools: tools && tools.length > 0 ? tools : undefined,
		model: typeof front.model === "string" && front.model ? front.model : undefined,
		systemPrompt: body,
		filePath,
	};
}

function loadAgents(agentsDir: string): AgentConfig[] {
	const agents: AgentConfig[] = [];
	if (!fs.existsSync(agentsDir)) return agents;

	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(agentsDir, { withFileTypes: true });
	} catch {
		return agents;
	}

	for (const entry of entries) {
		if (!entry.name.endsWith(".md")) continue;
		const filePath = path.join(agentsDir, entry.name);
		try {
			const parsed = parseAgentFile(fs.readFileSync(filePath, "utf-8"), filePath);
			if (parsed) agents.push(parsed);
		} catch {
			// skip unreadable files
		}
	}
	return agents;
}

/** Resolve how to invoke pi: same script if possible, else "pi" from PATH. */
function getPiInvocation(args: string[]): { command: string; args: string[]; shell: boolean } {
	const currentScript = process.argv[1];
	const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
	if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...args], shell: false };
	}

	const execName = path.basename(process.execPath).toLowerCase();
	const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
	if (!isGenericRuntime) {
		return { command: process.execPath, args, shell: false };
	}

	// Generic runtime without a resolvable script: use pi from PATH.
	// On Windows, pi is a .cmd shim, so spawn through a shell.
	return { command: "pi", args, shell: process.platform === "win32" };
}

interface UsageStats {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	cost: number;
	turns: number;
}

interface AgentRunResult {
	agent: string;
	task: string;
	exitCode: number;
	output: string;
	stderr: string;
	usage: UsageStats;
	errorMessage?: string;
}

function getFinalOutput(messages: any[]): string {
	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i];
		if (msg?.role === "assistant") {
			for (const part of msg.content ?? []) {
				if (part?.type === "text") return part.text;
			}
		}
	}
	return "";
}

async function runSingleAgent(
	agentsDir: string,
	defaultCwd: string,
	dispatchModel: string | undefined,
	dispatchThinking: string | undefined,
	agent: AgentConfig,
	task: string,
	signal: AbortSignal | undefined,
): Promise<AgentRunResult> {
	const args: string[] = ["--mode", "json", "-p", "--no-session"];
	const model = agent.model ?? dispatchModel;
	if (model) args.push("--model", model);
	if (!agent.model && dispatchThinking) args.push("--thinking", dispatchThinking);
	if (agent.tools) args.push("--tools", agent.tools.join(","));

	// Pass the agent system prompt via a temp file
	const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pi-subagent-"));
	const promptFile = path.join(tmpDir, "system-prompt.md");
	await fs.promises.writeFile(promptFile, agent.systemPrompt, { encoding: "utf-8", mode: 0o600 });
	args.push("--append-system-prompt", promptFile);
	args.push(`Task: ${task}`);

	const result: AgentRunResult = {
		agent: agent.name,
		task,
		exitCode: 0,
		output: "",
		stderr: "",
		usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, turns: 0 },
	};

	try {
		let wasAborted = false;
		result.exitCode = await new Promise<number>((resolve) => {
			const invocation = getPiInvocation(args);
			const proc = spawn(invocation.command, invocation.args, {
				cwd: defaultCwd,
				shell: invocation.shell,
				stdio: ["ignore", "pipe", "pipe"],
			});

			const messages: any[] = [];
			let buffer = "";

			const processLine = (line: string) => {
				if (!line.trim()) return;
				let event: any;
				try {
					event = JSON.parse(line);
				} catch {
					return;
				}
				if (event.type === "message_end" && event.message) {
					const msg = event.message;
					messages.push(msg);
					if (msg.role === "assistant") {
						result.usage.turns++;
						const usage = msg.usage;
						if (usage) {
							result.usage.input += usage.input || 0;
							result.usage.output += usage.output || 0;
							result.usage.cacheRead += usage.cacheRead || 0;
							result.usage.cacheWrite += usage.cacheWrite || 0;
							result.usage.cost += usage.cost?.total || 0;
						}
						if (msg.errorMessage) result.errorMessage = msg.errorMessage;
					}
					result.output = getFinalOutput(messages);
				}
			};

			proc.stdout.on("data", (data) => {
				buffer += data.toString();
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";
				for (const line of lines) processLine(line);
			});

			proc.stderr.on("data", (data) => {
				result.stderr += data.toString();
			});

			proc.on("close", (code) => {
				if (buffer.trim()) processLine(buffer);
				resolve(code ?? 0);
			});

			proc.on("error", (err) => {
				result.stderr += String(err);
				resolve(1);
			});

			if (signal) {
				const killProc = () => {
					wasAborted = true;
					proc.kill("SIGTERM");
					setTimeout(() => {
						try {
							proc.kill("SIGKILL");
						} catch {
							/* already dead */
						}
					}, 5000);
				};
				if (signal.aborted) killProc();
				else signal.addEventListener("abort", killProc, { once: true });
			}
		});

		if (wasAborted) throw new Error("Subagent was aborted");
		return result;
	} finally {
		try {
			fs.rmSync(tmpDir, { recursive: true, force: true });
		} catch {
			/* ignore */
		}
	}
}

function isFailed(result: AgentRunResult): boolean {
	return result.exitCode !== 0 || Boolean(result.errorMessage);
}

function truncateOutput(output: string): string {
	const bytes = Buffer.byteLength(output, "utf8");
	if (bytes <= OUTPUT_CAP) return output;
	return `${output.slice(0, OUTPUT_CAP)}\n\n[Output truncated: ${bytes - OUTPUT_CAP} bytes omitted.]`;
}

async function mapWithConcurrencyLimit<TIn, TOut>(
	items: TIn[],
	concurrency: number,
	fn: (item: TIn) => Promise<TOut>,
): Promise<TOut[]> {
	if (items.length === 0) return [];
	const limit = Math.max(1, Math.min(concurrency, items.length));
	const results: TOut[] = new Array(items.length);
	let nextIndex = 0;
	const workers = new Array(limit).fill(null).map(async () => {
		while (true) {
			const current = nextIndex++;
			if (current >= items.length) return;
			results[current] = await fn(items[current]);
		}
	});
	await Promise.all(workers);
	return results;
}

const TaskItem = Type.Object({
	agent: Type.String({ description: "Name of the agent to invoke" }),
	task: Type.String({ description: "Task to delegate to the agent" }),
});

const SubagentParams = Type.Object({
	agent: Type.Optional(Type.String({ description: "Agent name (single mode)" })),
	task: Type.Optional(Type.String({ description: "Task text (single mode)" })),
	tasks: Type.Optional(Type.Array(TaskItem, { description: "Parallel tasks" })),
});

export default function subagent(pi: ExtensionAPI) {
	// Agents approved this session (confirmed once per name)
	const approved = new Set<string>();

	pi.registerCommand("agents", {
		description: "List available subagents (from ./agents/*.md)",
		handler: async (_args, ctx) => {
			const agents = loadAgents(resolveAgentsDir(ctx.cwd));
			if (agents.length === 0) {
				ctx.ui.notify("No agents found in ./agents/*.md", "warning");
				return;
			}
			const lines = agents.map((a) => `${a.name} — ${a.description}`);
			ctx.ui.notify(lines.join("\n"), "info");
		},
	});

	pi.registerTool({
		name: "subagent",
		label: "Subagent",
		description:
			"Delegate a task to a specialized subagent with an isolated context (runs a separate pi process). Pass agent+task for a single run, tasks[] for parallel runs, or nothing to list available agents from ./agents/*.md (mermaid-maker, svg-maker).",
		promptSnippet: "Delegate diagram/illustration work to specialized subagents",
		promptGuidelines: [
			"Use subagent to delegate complex Mermaid or SVG creation to mermaid-maker/svg-maker so the main conversation stays focused.",
		],
		parameters: SubagentParams,

		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const agents = loadAgents(resolveAgentsDir(ctx.cwd));
			const dispatchModel = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : undefined;
			const dispatchThinking = ctx.thinkingLevel;

			const listText =
				agents.length === 0
					? "No agents found in ./agents/*.md"
					: `Available agents:\n${agents.map((a) => `- ${a.name}: ${a.description}`).join("\n")}`;

			// List mode
			const hasSingle = Boolean(params.agent && params.task);
			const hasTasks = (params.tasks?.length ?? 0) > 0;
			if (!hasSingle && !hasTasks) {
				return { content: [{ type: "text", text: listText }], details: { mode: "list", agents: agents.map((a) => a.name) } };
			}

			// Resolve + approve requested agents (they are project-controlled prompts)
			const requested = new Set<string>();
			if (params.agent) requested.add(params.agent);
			if (params.tasks) for (const t of params.tasks) requested.add(t.agent);

			const resolved: Record<string, AgentConfig> = {};
			for (const name of requested) {
				const agent = agents.find((a) => a.name === name);
				if (!agent) {
					return {
						content: [{ type: "text", text: `Unknown agent "${name}".\n${listText}` }],
						details: { mode: "error" },
					};
				}
				resolved[name] = agent;

				if (!approved.has(name) && ctx.hasUI) {
					const ok = await ctx.ui.confirm(
						"Run subagent?",
						`"${name}" is defined in this project (./agents/) and will run as a separate pi process with its own system prompt.\n\n${agent.description}`,
					);
					if (!ok) {
						return {
							content: [{ type: "text", text: `User declined to run subagent "${name}".` }],
							details: { mode: "cancelled" },
						};
					}
					approved.add(name);
				}
			}

			// Parallel mode
			if (hasTasks) {
				const tasks = params.tasks!;
				if (tasks.length > MAX_PARALLEL_TASKS) {
					return {
						content: [{ type: "text", text: `Too many parallel tasks (${tasks.length}). Max is ${MAX_PARALLEL_TASKS}.` }],
						details: { mode: "error" },
					};
				}

				const results = await mapWithConcurrencyLimit(tasks, MAX_CONCURRENCY, (t) =>
					runSingleAgent(
						resolveAgentsDir(ctx.cwd),
						ctx.cwd,
						dispatchModel,
						dispatchThinking,
						resolved[t.agent],
						t.task,
						signal,
					),
				);

				const successCount = results.filter((r) => !isFailed(r)).length;
				const summaries = results.map((r) => {
					const status = isFailed(r) ? "failed" : "completed";
					return `### [${r.agent}] ${status}\n\n${truncateOutput(r.errorMessage || r.stderr || r.output || "(no output)")}`;
				});
				return {
					content: [
						{ type: "text", text: `Parallel: ${successCount}/${results.length} succeeded\n\n${summaries.join("\n\n---\n\n")}` },
					],
					details: { mode: "parallel", results },
				};
			}

			// Single mode
			const result = await runSingleAgent(
				resolveAgentsDir(ctx.cwd),
				ctx.cwd,
				dispatchModel,
				dispatchThinking,
				resolved[params.agent!],
				params.task!,
				signal,
			);
			if (isFailed(result)) {
				throw new Error(`Subagent ${result.errorMessage || "failed"}: ${result.stderr || result.output || "(no output)"}`);
			}
			return {
				content: [{ type: "text", text: truncateOutput(result.output) || "(no output)" }],
				details: { mode: "single", results: [result] },
			};
		},

		renderCall(args, theme) {
			if (args.tasks && args.tasks.length > 0) {
				let text =
					theme.fg("toolTitle", theme.bold("subagent ")) + theme.fg("accent", `parallel (${args.tasks.length})`);
				for (const t of args.tasks.slice(0, 3)) {
					const preview = t.task.length > 40 ? `${t.task.slice(0, 40)}...` : t.task;
					text += `\n  ${theme.fg("accent", t.agent)}${theme.fg("dim", ` ${preview}`)}`;
				}
				return new Text(text, 0, 0);
			}
			const preview = args.task
				? args.task.length > 60
					? `${args.task.slice(0, 60)}...`
					: args.task
				: "...";
			return new Text(
				theme.fg("toolTitle", theme.bold("subagent ")) +
					theme.fg("accent", args.agent || "...") +
					`\n  ${theme.fg("dim", preview)}`,
				0,
				0,
			);
		},

		renderResult(result, _options, theme) {
			const details = result.details as { mode?: string } | undefined;
			const text = result.content[0];
			const firstLine = text?.type === "text" ? text.text.split("\n")[0] : "";
			if (details?.mode === "list" || details?.mode === "cancelled") {
				return new Text(theme.fg("muted", firstLine), 0, 0);
			}
			return new Text(theme.fg("success", "✓ ") + theme.fg("toolOutput", firstLine), 0, 0);
		},
	});
}
