/**
 * md-log.ts — Learning journal for the Obsidian vault
 *
 * Registers the `learning_log` tool. Appends styled markdown entries to
 * Learning/<subject>/logs/YYYY-MM-DD.md, creating the file (with frontmatter)
 * and directories on first use. Guarantees a consistent log format across
 * all subjects and sessions.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { StringEnum } from "@earendil-works/pi-ai";
import { type ExtensionAPI, withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import { VAULT_ROOT, sanitizeSegment } from "./visual-tools/vault";

function pad(n: number): string {
	return n.toString().padStart(2, "0");
}

interface LogEntryType {
	entryType: "session" | "lesson" | "quiz" | "feedback" | "milestone" | "review";
}

const LearningLogParams = Type.Object({
	subject: Type.String({ description: "Subject name, e.g. 'Machine Learning'" }),
	title: Type.String({ description: "Short entry title, e.g. 'Topic 3: Backprop — covered + quiz 7/8'" }),
	markdown: Type.String({ description: "Entry body in Obsidian markdown (what was covered, scores, gaps, next steps)" }),
	entryType: Type.Optional(
		StringEnum(["session", "lesson", "quiz", "feedback", "milestone", "review"] as const, {
			description: "Kind of entry. Default: session",
		}),
	),
	tags: Type.Optional(Type.Array(Type.String(), { description: "Extra tags for the entry" })),
	date: Type.Optional(
		Type.String({ description: "Entry date as YYYY-MM-DD. Default: today" }),
	),
});

const ENTRY_ICONS: Record<string, string> = {
	session: "📖",
	lesson: "🧠",
	quiz: "❓",
	feedback: "💬",
	milestone: "🏁",
	review: "🔁",
};

export default function mdLog(pi: ExtensionAPI) {
	pi.registerTool({
		name: "learning_log",
		label: "Learning Log",
		description:
			"Write a styled learning journal entry into the Obsidian vault (Learning/<subject>/logs/YYYY-MM-DD.md). Use at the end of every learning session, quiz, review, or milestone to keep a consistent record.",
		promptSnippet: "Write styled learning log entries to the Obsidian vault",
		promptGuidelines: [
			"Use learning_log at the end of every learning session, quiz, or review to record progress in the vault instead of hand-writing log files.",
		],
		parameters: LearningLogParams,

		async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
			const subject = sanitizeSegment(params.subject);
			const entryType = params.entryType ?? "session";

			// Date validation / default
			const dateRe = /^\d{4}-\d{2}-\d{2}$/;
			const now = new Date();
			const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
			const date = params.date && dateRe.test(params.date) ? params.date : today;

			const logDir = join(VAULT_ROOT, "Learning", subject, "logs");
			const logFile = join(logDir, `${date}.md`);
			const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
			const icon = ENTRY_ICONS[entryType] ?? "📖";
			const tags = ["learning-log", ...(params.tags ?? [])].map((t) => t.replace(/\s+/g, "-"));
			const yamlTags = tags.map((t) => `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);

			const section = [
				`## ${icon} ${time} — ${params.title.replace(/\n/g, " ")}`,
				"",
				`> [!info]- ${entryType} · ${date}${tags.length > 1 ? ` · ${tags.slice(1).map((t) => `#${t}`).join(" ")}` : ""}`,
				"",
				params.markdown.trim(),
				"",
			].join("\n");

			const frontmatter = [
				"---",
				"type: log",
				`subject: "${subject.replace(/"/g, "'")}"`,
				`date: ${date}`,
				`tags: [${yamlTags.join(", ")}]`,
				"---",
				"",
			].join("\n");

			await withFileMutationQueue(logFile, async () => {
				await mkdir(logDir, { recursive: true });
				let existing = "";
				try {
					existing = await readFile(logFile, "utf8");
				} catch {
					existing = ""; // new file
				}
				const next = existing.length === 0 ? frontmatter + section : existing.trimEnd() + "\n\n---\n\n" + section;
				await writeFile(logFile, next, "utf8");
			});

			const relative = `Learning/${subject}/logs/${date}.md`;
			return {
				content: [
					{
						type: "text",
						text: `Logged ${entryType} entry "${params.title}" to ${relative} (vault: ${VAULT_ROOT})`,
					},
				],
				details: { vaultFile: logFile, relativePath: relative, entryType, date, subject },
			};
		},

		renderCall(args, theme) {
			const entryType = (args as Partial<LogEntryType>).entryType ?? "session";
			let text =
				theme.fg("toolTitle", theme.bold("learning_log ")) +
				theme.fg("accent", `${ENTRY_ICONS[entryType] ?? ""} ${entryType}`);
			if (args.subject) text += theme.fg("dim", ` — ${args.subject}`);
			return new Text(text, 0, 0);
		},

		renderResult(result, _options, theme) {
			const text = result.content[0];
			return new Text(text?.type === "text" ? theme.fg("success", `✓ ${text.text}`) : "", 0, 0);
		},
	});
}
