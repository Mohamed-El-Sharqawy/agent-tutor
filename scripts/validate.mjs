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
 *   8. html artifacts     — every .html under skills/ and examples/ is
 *                           self-contained (no scripts, no external refs);
 *                           dashboard pages additionally carry a parsable
 *                           agent-tutor-state island + color-scheme meta and
 *                           resolve every relative page-to-page href;
 *                           log fragment files (logs/ + their template) stay
 *                           bare body-level markup and carry no island
 *
 * Pure node stdlib — no dependencies, no network. Exit 1 with a fix hint
 * for every failure.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
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
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text.replace(/^\uFEFF/, ""));
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

/** GitHub issue forms are whole-file YAML (no closing ---): scan top-level keys. */
function parseIssueForm(text) {
  const fm = {};
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim();
    if (Object.keys(fm).length >= 3 && kv === null && line.startsWith(" ")) break; // entered body
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
  const fm = parseIssueForm(readFileSync(file, "utf8"));
  if (!fm || !fm.name)
    fail("issue-templates", show(file), "Missing top-level name: key.", "Issue forms need a name: line.");
  else if (!fm.labels)
    fail("issue-templates", show(file), "No labels: in the template.", "Add labels: [...], e.g. good first issue feeders.");
}

// --- 8. html artifacts: self-contained pages + dashboard island --------------
//
// Contract (from the html-dashboard spec): pages are static HTML + inline CSS,
// consumable by Obsidian's HTML Reader plugin, a browser, or an agent parser.
// Dashboard pages carry their state in an `agent-tutor-state` JSON-comment
// island — the agent's single state read at session start. Log fragment files
// are the opposite shape: bare body-level fragments that stack through the day
// in one daily file — appendable (no document tags) and stateless (no island;
// logs are history, dashboards own the island).

const treeFiles = [...walk(join(root, "skills")), ...walk(join(root, "examples"))];
const htmlFiles = treeFiles.filter((p) => p.endsWith(".html"));
// Exact-case path set: an href must match the on-disk path's casing too —
// existsSync is case-insensitive on Windows, so a Subjects/x.html link would
// pass a dev machine and then break the Linux CI run.
const treePaths = new Set(treeFiles.map((p) => resolve(p)));

const ISLAND_KEYS = ["updated", "subjects", "due_notes", "recent"];
const ISLAND_SCHEMA = `Island schema: { ${ISLAND_KEYS.join(", ")} }.`;
const islandHint = 'One JSON object: <!-- agent-tutor-state {...} -->.';

// Log fragment files: the daily html logs under logs/ plus their template.
const isLogFragment = (file) => {
  const rel = show(file);
  return /(^|\/)logs\//.test(rel) || /\/templates\/log[-a-z]*\.html$/.test(rel);
};

let islandCount = 0;
let fragmentCount = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const name = show(file);

  if (/<script\b/i.test(html))
    fail("html", name, "Found <script> — pages must be static HTML+CSS.", "Remove it; all interactivity is plain links.");
  if (/<\s*(iframe|object|embed)\b/i.test(html))
    fail("html", name, "Found <iframe>/<object>/<embed> — they can pull in executable content.", "Remove it; link out instead.");
  if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(html))
    fail("html", name, "Inline event handler (on*=) — script in disguise.", "Use plain links; no JavaScript anywhere.");

  for (const m of html.matchAll(/\b(?:src|srcset|data)\s*=\s*["']?\s*((?:https?:)?\/\/[^"'\s>]+)/gi))
    fail("html", name, `Remote resource reference: ${m[1]}`, "Pages are self-contained — inline the asset or drop it.");
  if (/<link\b/i.test(html))
    fail("html", name, "Found <link> — styles must be inline in a <style> block.", "Replace with an inline <style> block.");
  if (/@import\b/i.test(html))
    fail("html", name, "Found @import — styles must be inline.", "Inline the styles.");
  for (const m of html.matchAll(/url\(\s*["']?\s*((?:https?:)?\/\/[^)"'\s]+)/gi))
    fail("html", name, `Remote CSS reference: ${m[1]}`, "Inline the asset (data: URIs are fine) or drop it.");

  // Island rule — scoped to dashboard pages (island carriers). Log fragments
  // are the inverse: an island there is state hiding in history — a failure.
  const island = /<!--\s*agent-tutor-state\s+([\s\S]*?)-->/.exec(html);
  if (isLogFragment(file)) {
    fragmentCount++;
    if (island)
      fail("html", name, "agent-tutor-state island in a log fragment file.", "Logs are history, never state — dashboards own the island. Remove it from the log.");
    if (/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(html))
      fail("html", name, "Document-level tags (<!DOCTYPE>/<html>/<head>/<body>) in a log fragment file.", "Fragments are bare body-level markup so entries can stack through the day; keep document tags out.");
  } else if (island) {
    islandCount++;
    let state;
    let parsed = false;
    try {
      state = JSON.parse(island[1].trim());
      parsed = true;
    } catch (e) {
      fail("html", name, `agent-tutor-state island does not parse as JSON (${e.message}).`, islandHint);
    }
    if (parsed) {
      if (state === null || typeof state !== "object" || Array.isArray(state)) {
        fail("html", name, "Island JSON must be one object.", ISLAND_SCHEMA);
        continue;
      }
      for (const key of ISLAND_KEYS)
        if (!(key in state))
          fail("html", name, `Island is missing "${key}".`, ISLAND_SCHEMA);
      for (const key of ["subjects", "recent"])
        if (!Array.isArray(state[key]))
          fail("html", name, `Island "${key}" must be an array (possibly empty).`, ISLAND_SCHEMA);
    }
    if (!/<meta\s+name=["']?color-scheme["']?\s+content=/i.test(html) &&
        !/<meta\s+content=["'][^"']*["']\s+name=["']?color-scheme["']?/i.test(html))
      fail("html", name, "Missing <meta name=\"color-scheme\">.", 'Add <meta name="color-scheme" content="light dark">.');
  }

  // Portable relative links — every generated page navigates with plain
  // relative hrefs (overview ↔ subject pages, back links). Any href pointing
  // at a local file must resolve next to the page, or the link is broken in
  // Obsidian's HTML Reader and in a browser alike. Skipped: fragments,
  // schemes (https:, mailto:, …), data:, and {{placeholder}} hrefs in
  // templates (the same skip the mermaid check applies to template fences) —
  // but a generated page that still carries a placeholder href is a failure,
  // the unfilled-placeholder leak this skip would otherwise hide.
  const isTemplate = name.startsWith("skills/");
  let linkChecked = 0;
  for (const m of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
    const href = m[1].trim();
    if (href.includes("{{")) {
      if (!isTemplate)
        fail("html", name, `Unfilled template placeholder in href: ${href}`, "Generated pages must fill every template placeholder.");
      continue;
    }
    if (href.startsWith("#")) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue; // scheme: https:, mailto:, data:, …
    linkChecked++;
    let target;
    try {
      target = resolve(dirname(file), decodeURIComponent(href.split("#")[0]));
    } catch {
      fail("html", name, `Malformed href (bad percent-encoding): ${href}`, "Percent-encode special characters in link targets.");
      continue;
    }
    if (!treePaths.has(target))
      fail("html", name, `Relative link target missing: ${href}`, "Links between generated pages must be relative and resolve in place.");
  }
  if (linkChecked) note(`    ${name}: ${linkChecked} relative link(s) resolved`);
}
note(`html: ${htmlFiles.length} file(s) linted, ${islandCount} dashboard island(s), ${fragmentCount} log fragment file(s)`);

// --- report -------------------------------------------------------------------

for (const n of notes) console.log(`  · ${n}`);
if (failures.length) {
  console.log(`\n✖ ${failures.length} failure(s):\n`); // stdout: keeps Actions log ordering stable
  for (const f of failures)
    console.log(`  [${f.check}] ${f.file}\n      ${f.message}${f.fix ? `\n      fix: ${f.fix}` : ""}\n`);
  process.exitCode = 1;
} else {
  console.log("\n✔ validate: all checks passed");
}
