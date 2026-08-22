/**
 * vault.ts — shared vault path helpers for visual tools
 */

import { join } from "node:path";

/**
 * Vault root resolution (same order as the skills' SKILL.md):
 *   1. OBSIDIAN_VAULT environment variable
 *   2. <cwd>/learning
 */
export const VAULT_ROOT = process.env.OBSIDIAN_VAULT || join(process.cwd(), "learning");

/** Windows reserves these device names (case-insensitive, also with extensions). */
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

/** Sanitize a subject/filename segment: strip path-hostile characters and names. */
export function sanitizeSegment(name: string): string {
	const s = name
		.replace(/[\x00-\x1f\x7f]/g, "")
		.trim()
		.replace(/[\\/:*?"<>|#^[\]]/g, "-")
		.replace(/\s+/g, " ")
		.slice(0, 80)
		.trim()
		.replace(/[. ]+$/, "");
	if (WINDOWS_RESERVED.test(s)) return `_${s}`;
	return s || "untitled";
}

/** Absolute path of Learning/<subject>/assets/<filename>.svg */
export function assetPath(subject: string, filename: string): string {
	return join(VAULT_ROOT, "Learning", sanitizeSegment(subject), "assets", `${sanitizeSegment(filename)}.svg`);
}

/** Path relative to the vault root, with forward slashes (for wikilinks). */
export function vaultRelative(absolutePath: string): string {
	const norm = absolutePath.replace(/\\/g, "/");
	const root = VAULT_ROOT.replace(/\\/g, "/").replace(/\/+$/, "");
	return norm.startsWith(`${root}/`) ? norm.slice(root.length + 1) : norm;
}

/** Obsidian embed wikilink for a vault file, e.g. ![[Learning/X/assets/y.svg]] */
export function embedLink(absolutePath: string): string {
	return `![[${vaultRelative(absolutePath)}]]`;
}
