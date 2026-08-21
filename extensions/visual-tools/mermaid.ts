/**
 * mermaid.ts — lightweight Mermaid linting for Obsidian-compatible diagrams
 *
 * Not a full parser: catches the mistakes that actually break Obsidian's
 * Mermaid renderer — wrong diagram type, unbalanced brackets/quotes, bad
 * arrows, unquoted special characters in labels, missing direction,
 * subgraph/end mismatches.
 */

export interface LintIssue {
	severity: "error" | "warning";
	message: string;
}

const DIAGRAM_TYPES = [
	"flowchart",
	"graph",
	"sequenceDiagram",
	"classDiagram",
	"stateDiagram",
	"stateDiagram-v2",
	"erDiagram",
	"journey",
	"gantt",
	"pie",
	"quadrantChart",
	"requirementDiagram",
	"mindmap",
	"timeline",
	"gitGraph",
	"sankey-beta",
	"xychart-beta",
	"block-beta",
	"packet-beta",
	"architecture-beta",
] as const;

/** Strip a surrounding ```mermaid fence if present. */
function unwrapFence(code: string): string {
	const text = code.replace(/^\uFEFF/, "").trim();
	const match = /^```[a-zA-Z-]*\s*\n([\s\S]*?)\n?```$/.exec(text);
	return match ? match[1].trim() : text;
}

function countChar(text: string, ch: string): number {
	let count = 0;
	for (const c of text) if (c === ch) count++;
	return count;
}

export function lintMermaid(code: string): { ok: boolean; issues: LintIssue[] } {
	const issues: LintIssue[] = [];
	const text = unwrapFence(code);
	const lines = text.split("\n").map((l) => l.replace(/\r$/, ""));
	const firstLine = (lines.find((l) => l.trim().length > 0) ?? "").trim();

	if (!firstLine) {
		return { ok: false, issues: [{ severity: "error", message: "Diagram is empty." }] };
	}

	// Diagram type
	const typeMatch = /^([a-zA-Z-]+)(\s|$)/.exec(firstLine);
	const diagramType = typeMatch ? typeMatch[1] : "";
	if (!DIAGRAM_TYPES.includes(diagramType as (typeof DIAGRAM_TYPES)[number])) {
		issues.push({
			severity: "error",
			message: `Unknown diagram type "${diagramType}". Start with one of: ${DIAGRAM_TYPES.join(", ")}.`,
		});
	}

	const isFlow = diagramType === "flowchart" || diagramType === "graph";
	const isSequence = diagramType === "sequenceDiagram";

	// Direction for flowcharts
	if (isFlow) {
		const direction = /^(?:flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/.exec(firstLine);
		if (!direction) {
			issues.push({
				severity: "warning",
				message: 'Flowchart has no direction. Add one: flowchart TB | TD | BT | RL | LR.',
			});
		}
	}

	if (lines.length < 2) {
		issues.push({ severity: "error", message: "Diagram has no content after the type declaration." });
	}

	// Balanced delimiters
	for (const [open, close, name] of [
		["(", ")", "parentheses ()"],
		["[", "]", "square brackets []"],
		["{", "}", "curly braces {}"],
		['"', '"', 'double quotes "'],
	] as const) {
		const opens = countChar(text, open);
		const closes = countChar(text, close);
		if (open === close) {
			if (opens % 2 !== 0) issues.push({ severity: "error", message: `Unbalanced ${name}.` });
		} else if (opens !== closes) {
			issues.push({ severity: "error", message: `Unbalanced ${name}: ${opens} opening vs ${closes} closing.` });
		}
	}

	// Common arrow mistake (=> is not a mermaid edge; sequence uses ->> etc.)
	if (!isSequence) {
		if (/=>/.test(text) && !/->|-->/.test(text)) {
			issues.push({
				severity: "error",
				message: 'Found "=>" — Mermaid edges use "-->" (or "---", "-.->").',
			});
		}
		if (/->(?![>|-])/.test(text) && !/-->/.test(text)) {
			issues.push({
				severity: "warning",
				message: 'Single "->" found — flowchart edges use "-->", sequence diagrams use "->>".',
			});
		}
	}

	// Unquoted special characters inside [] labels (breaks the renderer)
	const labelParens = /\[[^\]"'\n]*[()]/.exec(text);
	if (isFlow && labelParens) {
		issues.push({
			severity: "error",
			message: `Parentheses inside an unquoted [] label: "${labelParens[0].slice(0, 40)}" — wrap the label in quotes: A["Label (x)"].`,
		});
	}

	// subgraph/end balance for flowcharts
	if (isFlow) {
		const subgraphs = lines.filter((l) => /^\s*subgraph\b/.test(l)).length;
		const ends = lines.filter((l) => /^\s*end\b/.test(l)).length;
		if (subgraphs !== ends) {
			issues.push({
				severity: "error",
				message: `subgraph/end mismatch: ${subgraphs} subgraph vs ${ends} end.`,
			});
		}
	}

	// Tabs can break some renderers
	if (text.includes("\t")) {
		issues.push({ severity: "warning", message: "Diagram contains tab characters — replace with spaces." });
	}

	return { ok: !issues.some((i) => i.severity === "error"), issues };
}

export function formatIssues(issues: LintIssue[]): string {
	if (issues.length === 0) return "No issues found.";
	return issues.map((i) => `[${i.severity}] ${i.message}`).join("\n");
}
