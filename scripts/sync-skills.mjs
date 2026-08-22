#!/usr/bin/env node
/**
 * scripts/sync-skills.mjs — one source of truth for skills.
 *
 * skills/ is canonical. This script copies every skill into the project
 * skill directories that coding agents read when you open this repo:
 *
 *   .agents/skills/   Codex, Cursor, GitHub Copilot, Amp, Cline, Warp,
 *                     Zed, Gemini CLI, OpenCode, Antigravity, Replit
 *   .claude/skills/   Claude Code
 *   .windsurf/skills/ Windsurf
 *
 * pi needs no copy: .pi/settings.json points at ../skills directly.
 *
 * Run after every change to skills/ and commit the result:
 *   node scripts/sync-skills.mjs
 *
 * CI (skills-sync.yml) fails if the committed copies drift from skills/.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "skills");
const targets = [
  join(root, ".agents", "skills"),
  join(root, ".claude", "skills"),
  join(root, ".windsurf", "skills"),
];

if (!existsSync(join(source, "agent-tutor", "SKILL.md"))) {
  console.error(`source not found: ${source}/agent-tutor/SKILL.md`);
  process.exit(1);
}

const skills = readdirSync(source, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(source, d.name, "SKILL.md")))
  .map((d) => d.name);

for (const target of targets) {
  mkdirSync(target, { recursive: true });
  for (const skill of skills) {
    rmSync(join(target, skill), { recursive: true, force: true });
    cpSync(join(source, skill), join(target, skill), { recursive: true });
  }
  for (const entry of readdirSync(target)) {
    if (!skills.includes(entry)) {
      console.warn(`${relative(root, join(target, entry))}: not managed by sync-skills — left untouched`);
    }
  }
  console.log(`${relative(root, target)}: ${skills.length} skills`);
}

function relative(from, to) {
  return to.replaceAll("\\", "/").replace(from.replaceAll("\\", "/") + "/", "");
}
