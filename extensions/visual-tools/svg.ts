/**
 * svg.ts — SVG validation and vault saving
 *
 * checkSvg: stack-based well-formedness check plus Obsidian compatibility
 * warnings (scripts, foreignObject, tiny text, external refs).
 *
 * saveSvg: validate then write to Learning/<subject>/assets/<name>.svg,
 * returning the Obsidian embed syntax.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { assetPath, embedLink, sanitizeSegment, vaultRelative } from "./vault.ts";

export interface SvgIssue {
	severity: "error" | "warning";
	message: string;
}

export function checkSvg(svg: string): { ok: boolean; issues: SvgIssue[] } {
	const issues: SvgIssue[] = [];
	const text = svg.replace(/^\uFEFF/, "").trim();

	if (!/<svg[\s>]/.test(text)) {
		return { ok: false, issues: [{ severity: "error", message: "Missing <svg> root element." }] };
	}
	if (!/<\/svg>\s*$/.test(text)) {
		issues.push({ severity: "error", message: "Missing closing </svg>." });
	}
	if (!/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(text)) {
		issues.push({
			severity: "error",
			message: 'Missing xmlns="http://www.w3.org/2000/svg" — required or the file will not render.',
		});
	}
	if (!/viewBox=["'][^"']+["']/.test(text)) {
		issues.push({
			severity: "warning",
			message: "No viewBox — the image will not scale. Add e.g. viewBox=\"0 0 800 400\".",
		});
	}

	// Security / compatibility
	if (/<script[\s>]/i.test(text)) {
		issues.push({ severity: "error", message: "<script> is not allowed — Obsidian strips it anyway." });
	}
	if (/\son\w+\s*=/i.test(text)) {
		issues.push({ severity: "error", message: "Inline event handlers (onclick=...) are not allowed." });
	}
	if (/<foreignObject[\s>]/i.test(text)) {
		issues.push({
			severity: "warning",
			message: "<foreignObject> is stripped by Obsidian's sanitizer — use native SVG elements.",
		});
	}
	if (/href=["']https?:\/\//i.test(text)) {
		issues.push({
			severity: "warning",
			message: "External href reference — will likely not load inside Obsidian. Inline everything.",
		});
	}

	// Well-formedness: stack-based tag matching over comments/PI/doctype-stripped text
	const stripped = text
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<\?[\s\S]*?\?>/g, "")
		.replace(/<!DOCTYPE[^>]*>/gi, "")
		.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");

	const tagRe = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
	const stack: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = tagRe.exec(stripped)) !== null) {
		const [, closing, name, , selfClosing] = match;
		if (closing) {
			const top = stack.pop();
			if (top !== name) {
				issues.push({
					severity: "error",
					message: `Mismatched tags: </${name}> closes <${top ?? "(nothing)"}>.`,
				});
				if (top === undefined) tagRe.lastIndex = stripped.length;
			}
		} else if (!selfClosing) {
			stack.push(name);
		}
	}
	if (stack.length > 0) {
		issues.push({
			severity: "error",
			message: `Unclosed element(s): ${stack.map((t) => `<${t}>`).join(", ")}.`,
		});
	}

	// Legibility
	const fontSizes: number[] = [];
	const fsRe = /font-size\s*=\s*"?(\d+(?:\.\d+)?)"?/gi;
	let fsMatch: RegExpExecArray | null;
	while ((fsMatch = fsRe.exec(text)) !== null) {
		fontSizes.push(Number(fsMatch[1]));
	}
	if (fontSizes.length > 0 && Math.min(...fontSizes) < 12) {
		issues.push({
			severity: "warning",
			message: `Smallest font-size is ${Math.min(...fontSizes)}px — text under 12-14px is hard to read.`,
		});
	}

	return { ok: !issues.some((i) => i.severity === "error"), issues };
}

export function formatSvgIssues(issues: SvgIssue[]): string {
	if (issues.length === 0) return "No issues found.";
	return issues.map((i) => `[${i.severity}] ${i.message}`).join("\n");
}

export interface SaveSvgResult {
	path: string;
	relativePath: string;
	wikilink: string;
	markdownEmbed: string;
}

export async function saveSvg(subject: string, filename: string, svg: string): Promise<SaveSvgResult> {
	const check = checkSvg(svg);
	if (!check.ok) {
		throw new Error(`SVG failed validation:\n${formatSvgIssues(check.issues)}`);
	}

	const absolute = assetPath(subject, filename);
	await withFileMutationQueue(absolute, async () => {
		await mkdir(dirname(absolute), { recursive: true });
		await writeFile(absolute, svg.trim() + "\n", "utf8");
	});

	const relativePath = vaultRelative(absolute);
	const encodedPath = relativePath
		.replace(/%/g, "%25")
		.replace(/\(/g, "%28")
		.replace(/\)/g, "%29")
		.replace(/ /g, "%20");
	return {
		path: absolute,
		relativePath,
		wikilink: embedLink(absolute),
		markdownEmbed: `![${sanitizeSegment(filename)}](${encodedPath})`,
	};
}
