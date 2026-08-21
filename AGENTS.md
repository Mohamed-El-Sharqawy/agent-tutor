# Learning System

This workspace is the source repo for **learning-system** — agent-agnostic tutoring skills plus optional pi extensions. It is also a live learning workspace: the owner runs learning sessions here.

## Layout

| Location | What it does |
|---|---|
| `skills/learning-system` | Umbrella skill: intake → plan → lessons → quizzes → logs (works on any agent) |
| `skills/learning-review` | Standalone spaced-repetition review skill |
| `skills/learning-visualize` | Diagram selection + Mermaid/SVG standards |
| `extensions/md-log.ts` | pi `learning_log` tool: styled log entries in the vault |
| `extensions/quiz.ts` | pi `quiz` tool: interactive multiple-choice quizzes |
| `extensions/visual-tools/` | pi `mermaid_lint`, `svg_check`, `svg_save` tools |
| `extensions/subagent.ts` | pi `subagent` tool: delegates to agents in `agents/*.md` |
| `agents/mermaid-maker.md`, `agents/svg-maker.md` | Diagram/illustration subagents |
| `examples/vault/` | Sample filled-in vault for the README |

## Vault location

All learning content goes under `Learning/` inside the vault root, resolved as:

1. `OBSIDIAN_VAULT` environment variable (set it to your vault path)
2. fallback: `./learning` in the current workspace

Never hardcode absolute vault paths in skills, extensions, or templates.

## Session routine (when using this as a learning workspace)

1. Read `Learning/Dashboard.md` in the vault to see active subjects, the review queue, and recent activity.
2. New subject → the `learning-system` skill drives it.
3. Diagram work → `learning-visualize`; delegate complex visuals to the subagents.
4. Revisit / practice → `learning-review`.
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
