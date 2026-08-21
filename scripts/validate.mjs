#!/usr/bin/env node
/**
 * scripts/validate.mjs — the single validator CI runs on every PR.
 *
 * Replaces the manual pre-PR loop: no local testing needed. Covers
 * everything that used to be checked by hand:
 *
 *   1. skills spec        — frontmatter, name, description (<1024), version
 *   2. self-containment   — SKILL.md links must not escape the skill dir
 *   3. template links     — every templates/... link in SKILL.md exists
 *   4. sync drift         — skills/ vs .agents/.claude/.windsurf copies
 *   5. mermaid diagrams   — README, docs/, skills/, agents/, example vault
 *                           (rules ported from extensions/visual-tools/mermaid.ts)
 *   6. vault wikilinks    — every [[link]] in examples/vault resolves
 *   7. issue templates    — frontmatter with name + labels
 *
 * Pure node stdlib — no dependencies, no network. Exit 1 with a fix hint
 * for every failure.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];

function fail(check, file, message, fix) {
  failures.push({ check, file, message, fix });
}
function note(message) {
  notes.push(message);
}

function walk(dir, filter = () => true, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".obsidian" || entry.name === "node_modules" || entry.name === ".git") continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, filter, acc);
    else if (filter(p)) acc.push(p);
  }
  return acc;
}
const mdFiles = (dir) => walk(dir, (p) => p.endsWith(".md"));
const show = (p) => relative(root, p).replaceAll("\\", "/");

// --- 1–3. skills: spec, self-containment, template links ------------------

function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

const skillsDir = join(root, "skills");
const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, "SKILL.md")))
  .map((d) => d.name);

if (skills.length === 0) fail("skills-spec", "skills/", "No skills found under skills/");

for (const skill of skills) {
  const skillPath = join(skillsDir, skill);
  const file = join(skillPath, "SKILL.md");
  const text = readFileSync(file, "utf8");
  const fm = parseFrontmatter(text);

  if (!fm) {
    fail("skills-spec", show(file), "Missing YAML frontmatter (--- ... ---).");
    continue;
  }
  if (fm.name !== skill)
    fail("skills-spec", show(file), `frontmatter name "${fm.name}" != directory "${skill}".`, "Rename the directory or fix name:.");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name ?? ""))
    fail("skills-spec", show(file), `name "${fm.name}" must be lowercase-hyphen.`, "See the Agent Skills spec.");
  if (!fm.description || fm.description.length < 10)
    fail("skills-spec", show(file), "description missing or too short.");
  const descLength = (fm.description ?? "").length;
  if (descLength >= 1024)
    fail("skills-spec", show(file), `description is ${descLength} chars (max 1023).`);
  if (!fm.version)
    fail("skills-spec", show(file), "No version: field (update check depends on it).");

  // self-containment + template links
  const links = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).filter((l) => !/^[a-z]+:/.test(l));
  for (const link of links) {
    const clean = link.split("#")[0];
    if (!clean) continue;
    if (/[<>]/.test(clean)) continue; // placeholder paths like <subject>/assets/x.svg
    if (clean.startsWith("../"))
      fail("self-containment", show(file), `Link escapes the skill dir: ${link}`, "Skills must be self-contained (per-skill installs break otherwise).");
    if (/^(skills|scripts|extensions|agents|docs|examples)\//.test(clean))
      fail("self-containment", show(file), `Link points outside the skill dir: ${link}`, "Skills must be self-contained.");
    if (!existsSync(join(skillPath, clean)))
      fail("template-links", show(file), `Broken link: ${link}`, "Fix the path or add the file.");
  }
}
note(`skills: ${skills.length} found (${skills.join(", ")})`);

// --- 4. sync drift ----------------------------------------------------------

const targets = [".agents/skills", ".claude/skills", ".windsurf/skills"];
function treeEquals(a, b) {
  if (!existsSync(b)) return { ok: false, reason: `${show(b)} missing` };
  const filesA = walk(a).map((p) => relative(a, p).replaceAll("\\", "/")).sort();
  const filesB = walk(b).map((p) => relative(b, p).replaceAll("\\", "/")).sort();
  if (filesA.join("|") !== filesB.join("|")) {
    const onlyA = filesA.filter((f) => !filesB.includes(f));
    const onlyB = filesB.filter((f) => !filesA.includes(f));
    return { ok: false, reason: `differs${onlyA.length ? ` — only in skills/: ${onlyA.slice(0, 3).join(", ")}` : ""}${onlyB.length ? ` — only in copy: ${onlyB.slice(0, 3).join(", ")}` : ""}` };
  }
  for (const f of filesA) {
    if (readFileSync(join(a, f), "utf8") !== readFileSync(join(b, f), "utf8"))
      return { ok: false, reason: `content differs: ${f}` };
  }
  return { ok: true };
}
for (const skill of skills) {
  for (const t of targets) {
    const cmp = treeEquals(join(skillsDir, skill), join(root, t, skill));
    if (!cmp.ok)
      fail("sync-drift", `${t}/${skill}`, cmp.reason, "Run: npm run sync — or let the CI bot auto-fix your PR.");
  }
}

// --- 5. mermaid lint (ported from extensions/visual-tools/mermaid.ts) ------

const DIAGRAM_TYPES = ["flowchart","graph","sequenceDiagram","classDiagram","stateDiagram","stateDiagram-v2","erDiagram","journey","gantt","pie","quadrantChart","requirementDiagram","mindmap","timeline","gitGraph","sankey-beta","xychart-beta","block-beta","packet-beta","architecture-beta"];

function lintMermaid(code) {
  const issues = [];
  const text = code.trim();
  const lines = text.split("\n").map((l) => l.replace(/\r$/, ""));
  const firstLine = (lines.find((l) => l.trim().length > 0) ?? "").trim();
  if (!firstLine) return [{ severity: "error", message: "Diagram is empty." }];

  const typeMatch = /^([a-zA-Z-]+)(\s|$)/.exec(firstLine);
  const diagramType = typeMatch ? typeMatch[1] : "";
  if (!DIAGRAM_TYPES.includes(diagramType))
    issues.push({ severity: "error", message: `Unknown diagram type "${diagramType}".` });

  const isFlow = diagramType === "flowchart" || diagramType === "graph";
  const isSequence = diagramType === "sequenceDiagram";

  if (isFlow && !/^(?:flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/.test(firstLine))
    issues.push({ severity: "warning", message: "Flowchart has no direction." });
  if (lines.length < 2)
    issues.push({ severity: "error", message: "No content after the type declaration." });

  for (const [open, close, name] of [["(", ")", "parentheses"], ["[", "]", "square brackets"], ["{", "}", "curly braces"], ['"', '"', 'double quotes']]) {
    const count = (ch) => [...text].filter((c) => c === ch).length;
    const o = count(open), c = count(close);
    if (open === close ? o % 2 !== 0 : o !== c)
      issues.push({ severity: "error", message: `Unbalanced ${name}.` });
  }

  if (!isSequence) {
    if (/=>/.test(text) && !/->|-->/.test(text))
      issues.push({ severity: "error", message: 'Found "=>" — Mermaid edges use "-->".' });
  }
  const labelParens = /\[[^\]"'\n]*[()]/.exec(text);
  if (isFlow && labelParens)
    issues.push({ severity: "error", message: `Parentheses inside an unquoted [] label: "${labelParens[0].slice(0, 40)}" — wrap in quotes.` });

  if (isFlow) {
    const sub = lines.filter((l) => /^\s*subgraph\b/.test(l)).length;
    const ends = lines.filter((l) => /^\s*end\b/.test(l)).length;
    if (sub !== ends) issues.push({ severity: "error", message: `subgraph/end mismatch: ${sub} vs ${ends}.` });
  }
  if (text.includes("\t")) issues.push({ severity: "warning", message: "Tab characters — use spaces." });
  return issues;
}

const mermaidFiles = [
  ...mdFiles(join(root, "skills")),
  ...mdFiles(join(root, "docs")),
  ...mdFiles(join(root, "examples", "vault")),
  ...mdFiles(join(root, "agents")),
  join(root, "README.md"),
  join(root, "AGENTS.md"),
].filter(existsSync);

let diagramCount = 0;
for (const file of mermaidFiles) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/```mermaid[^\n]*\n([\s\S]*?)```/g)) {
    if (m[1].includes("{{")) continue; // template placeholder fence, not a real diagram
    diagramCount++;
    for (const issue of lintMermaid(m[1])) {
      if (issue.severity === "error")
        fail("mermaid", show(file), issue.message, "Fix the diagram — Obsidian's renderer will break on it.");
      else note(`mermaid warning: ${show(file)} — ${issue.message}`);
    }
  }
}
note(`mermaid: ${diagramCount} diagrams linted`);

// --- 6. example-vault wikilink integrity -------------------------------------

const vault = join(root, "examples", "vault");
const vaultFiles = walk(vault);
const stemIndex = new Map(vaultFiles.map((p) => [p.replace(/\\/g, "/").split("/").pop().replace(/\.[^.]+$/, ""), p]));
let linkCount = 0;
for (const file of mdFiles(vault)) {
  for (const m of readFileSync(file, "utf8").matchAll(/!?\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    const target = m[1].trim().replace(/\\+$/, ""); // strip Obsidian's table pipe-escape
    const stem = target.split("/").pop().replace(/\.[^.]+$/, "");
    linkCount++;
    if (!stemIndex.has(stem) && !stemIndex.has(target))
      fail("vault-wikilinks", show(file), `Unresolvable wikilink: [[${target}]]`, "Add the file or fix the link — breaks the Pages build.");
  }
}
note(`vault: ${linkCount} wikilinks resolved`);

// --- 7. issue templates -------------------------------------------------------

const issueDir = join(root, ".github", "ISSUE_TEMPLATE");
for (const file of mdFiles(issueDir)) {
  const fm = parseFrontmatter(readFileSync(file, "utf8"));
  if (!fm || !fm.name)
    fail("issue-templates", show(file), "Missing frontmatter with name:.");
  else if (!fm.labels)
    fail("issue-templates", show(file), "No labels: in frontmatter.");
}

// --- report -------------------------------------------------------------------

for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.error(`\n✖ ${failures.length} failure(s):\n`);
  for (const f of failures)
    console.error(`  [${f.check}] ${f.file}\n      ${f.message}${f.fix ? `\n      fix: ${f.fix}` : ""}\n`);
  process.exit(1);
}
console.log("\n✔ validate: all checks passed");
