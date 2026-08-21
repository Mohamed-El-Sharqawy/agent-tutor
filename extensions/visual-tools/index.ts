/**
 * visual-tools — custom tools for vault visuals
 *
 * Registers three tools:
 *   mermaid_lint  — validate Mermaid code before embedding it in notes
 *   svg_check     — validate SVG markup (well-formedness + Obsidian compat)
 *   svg_save      — validate + save an SVG into Learning/<subject>/assets/,
 *                   returning the Obsidian embed syntax
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import { formatIssues, lintMermaid } from "./mermaid.ts";
import { checkSvg, formatSvgIssues, saveSvg } from "./svg.ts";

export default function visualTools(pi: ExtensionAPI) {
	pi.registerTool({
		name: "mermaid_lint",
		label: "Mermaid Lint",
		description:
			"Validate Mermaid diagram code for syntax problems that break Obsidian's renderer (unbalanced brackets, bad arrows, unquoted special characters, wrong diagram type). Run this on every Mermaid block before writing it into a note.",
		promptSnippet: "Validate Mermaid diagram code before embedding in vault notes",
		promptGuidelines: [
			"Use mermaid_lint on every Mermaid diagram before embedding it in a vault note; fix all errors it reports.",
		],
		parameters: Type.Object({
			mermaid: Type.String({ description: "Mermaid code (with or without a ```mermaid fence)" }),
		}),
		async execute(_toolCallId, params) {
			const { ok, issues } = lintMermaid(params.mermaid);
			const header = ok
				? `Mermaid OK${issues.length > 0 ? ` (${issues.length} warning(s))` : ""}`
				: `Mermaid has ${issues.filter((i) => i.severity === "error").length} error(s)`;
			return {
				content: [{ type: "text", text: `${header}\n${formatIssues(issues)}` }],
				details: { ok, issues },
			};
		},
		renderCall(_args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("mermaid_lint")), 0, 0);
		},
		renderResult(result, _options, theme) {
			const text = result.content[0];
			const ok = !text?.type || (result.details as { ok?: boolean })?.ok !== false;
			return new Text(
				ok ? theme.fg("success", "✓ valid") : theme.fg("error", "✗ issues found"),
				0,
				0,
			);
		},
	});

	pi.registerTool({
		name: "svg_check",
		label: "SVG Check",
		description:
			"Validate SVG markup: well-formed XML, required xmlns/viewBox, no scripts or foreignObject, readable font sizes. Use before saving or embedding an SVG in a note.",
		promptSnippet: "Validate SVG markup for Obsidian compatibility",
		parameters: Type.Object({
			svg: Type.String({ description: "The complete SVG markup" }),
		}),
		async execute(_toolCallId, params) {
			const { ok, issues } = checkSvg(params.svg);
			const header = ok
				? `SVG OK${issues.length > 0 ? ` (${issues.length} warning(s))` : ""}`
				: `SVG has ${issues.filter((i) => i.severity === "error").length} error(s)`;
			return {
				content: [{ type: "text", text: `${header}\n${formatSvgIssues(issues)}` }],
				details: { ok, issues },
			};
		},
		renderCall(_args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("svg_check")), 0, 0);
		},
		renderResult(result, _options, theme) {
			const ok = (result.details as { ok?: boolean })?.ok !== false;
			return new Text(ok ? theme.fg("success", "✓ valid") : theme.fg("error", "✗ issues found"), 0, 0);
		},
	});

	pi.registerTool({
		name: "svg_save",
		label: "SVG Save",
		description:
			"Validate and save an SVG illustration into the Obsidian vault at Learning/<subject>/assets/<filename>.svg, then return the Obsidian embed syntax (![[...]] wikilink).",
		promptSnippet: "Save validated SVGs into the vault assets folder with embed syntax",
		promptGuidelines: [
			"Use svg_save (not raw write) to store SVG illustrations in the vault so they are validated and land in the right assets folder.",
		],
		parameters: Type.Object({
			subject: Type.String({ description: "Subject the illustration belongs to" }),
			filename: Type.String({ description: "File name without extension, e.g. 'neural-network-overview'" }),
			svg: Type.String({ description: "The complete SVG markup" }),
		}),
		async execute(_toolCallId, params) {
			try {
				const result = await saveSvg(params.subject, params.filename, params.svg);
				return {
					content: [
						{
							type: "text",
							text: [
								`Saved: ${result.path}`,
								`Embed in notes with: ${result.wikilink}`,
								`(standard markdown equivalent: ${result.markdownEmbed})`,
							].join("\n"),
						},
					],
					details: result,
				};
			} catch (error) {
				throw error instanceof Error ? error : new Error(String(error));
			}
		},
		renderCall(args, theme) {
			let text = theme.fg("toolTitle", theme.bold("svg_save "));
			if (args.filename) text += theme.fg("accent", `${args.filename}.svg`);
			if (args.subject) text += theme.fg("dim", ` — ${args.subject}`);
			return new Text(text, 0, 0);
		},
		renderResult(result, _options, theme) {
			const text = result.content[0];
			return new Text(text?.type === "text" ? theme.fg("success", `✓ ${text.text.split("\n")[1] ?? "saved"}`) : "", 0, 0);
		},
	});
}
