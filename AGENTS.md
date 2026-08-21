# Learning System

This workspace is the source repo for **agent-tutor** — agent-agnostic tutoring skills plus optional pi extensions. It is also a live learning workspace: the owner runs learning sessions here.

## Layout

| Location | What it does |
|---|---|
| `skills/agent-tutor` | Umbrella skill: intake → plan → lessons → quizzes → logs (works on any agent) |
| `skills/agent-tutor-review` | Standalone spaced-repetition review skill |
| `skills/agent-tutor-visualize` | Diagram selection + Mermaid/SVG standards |
| `extensions/md-log.ts` | pi `learning_log` tool: styled log entries in the vault |
| `extensions/quiz.ts` | pi `quiz` tool: interactive multiple-choice quizzes |
| `extensions/visual-tools/` | pi `mermaid_lint`, `svg_check`, `svg_save` tools |
| `extensions/subagent.ts` | pi `subagent` tool: delegates to agents in `agents/*.md` |
| `agents/mermaid-maker.md`, `agents/svg-maker.md` | Diagram/illustration subagents |
| `examples/vault/` | Sample filled-in vault for the README |
| `.pi/settings.json` | Loads the skills and extensions in pi (points at `skills/`, no copy) |
| `.agents/skills/`, `.claude/skills/`, `.windsurf/skills/` | **Generated** copies of `skills/` so the repo works out of the box in other agents. Run `node scripts/sync-skills.mjs` after changing `skills/`. CI fails on drift. Do not edit these directly. |

## Vault location

All learning content goes under `Learning/` inside the vault root, resolved as:

1. `OBSIDIAN_VAULT` environment variable (set it to your vault path)
2. fallback: `./learning` in the current workspace

Never hardcode absolute vault paths in skills, extensions, or templates.

## Session routine (when using this as a learning workspace)

1. Read `Learning/Dashboard.md` in the vault to see active subjects, the review queue, and recent activity.
2. New subject → the `agent-tutor` skill drives it.
3. Diagram work → `agent-tutor-visualize`; delegate complex visuals to the subagents.
4. Revisit / practice → `agent-tutor-review`.
5. End every session with a log entry (`learning_log` tool or the fallback format in the skill).

## Ground rules

- Vault writes go under `Learning/<Subject>/...` only — never touch anything outside `Learning/` without asking.
- Be honest about the user's progress. Never inflate quiz results or understanding.
- Skills must stay agent-agnostic: every pi-tool mention needs a plain fallback. Test both paths.
- Notes must be well-styled Obsidian markdown: YAML frontmatter, callouts, wikilinks, and tables where they help.

## Repo conventions

- Skills follow the [Agent Skills](https://agentskills.io) spec: lowercase-hyphen `name`, specific `description` (< 1024 chars).
- `npx skills add ./ --list` must discover all three skills; keep skill directories self-contained (no cross-skill file references — they break per-skill installs).
- pi extensions: validate TS by loading (`pi` starts clean); peer deps only, no bundling.
