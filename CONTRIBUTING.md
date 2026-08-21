# Contributing to agent-tutor

**Skills are just markdown — you don't need to write code to contribute.**

Most of this repo is instructions, templates, and documentation. A subject pack, a translation, or a better diagram recipe is a one-file pull request. Code contributions (the pi extensions, the sync script) are welcome too, but they are the minority of the surface area.

## Ways to contribute (easiest first)

| Way | What it involves | Label |
|---|---|---|
| 📦 **Subject packs** | A curated starter `plan.md` for a subject (Rust, Kubernetes, ML, Arabic for developers…): phases, topics, success criteria. One markdown file in `skills/agent-tutor/subject-packs/`. | `subject-pack` |
| 🌍 **Translations** | A README translation (Arabic and Chinese are the priorities). Copy `README.md` → `README.<lang>.md` and translate. | `translation` |
| 🎨 **Diagram recipes** | New Mermaid/SVG recipes for `agent-tutor-visualize` (timelines, hierarchies, comparison layouts). | `good first issue` |
| 🧩 **Templates** | Improve `templates/*.md` (lesson, plan, quiz report, learner profile, sources). | `good first issue` |
| 🛠 **Extensions** | The pi extensions in `extensions/` are TypeScript with peer dependencies only. | `enhancement` |
| 🐛 **Bug reports** | Always welcome. Include your agent name, the skill version from the SKILL.md frontmatter, and what the tutor did vs. what you expected. | `bug` |

## Repo map (read this once)

```
skills/                    ← THE product. Agent-agnostic skills (edit here)
  agent-tutor/             ← intake → profile → plan → lessons → quizzes → reviews
  agent-tutor-review/      ← spaced-repetition review sessions
  agent-tutor-visualize/   ← diagram rules (Mermaid/SVG)
extensions/                ← optional pi tools (quiz, learning_log, validators)
templates are inside skills/<skill>/templates/
.agents/ .claude/ .windsurf/  ← GENERATED copies. Do not edit. See below.
scripts/sync-skills.mjs    ← regenerates the generated copies from skills/
docs/                      ← research + launch materials
examples/vault/            ← the sample Obsidian vault (rendered on Pages)
```

**Why three copies of `skills/`?** Different agents read skills from different folders. They are generated so the repo works out of the box in every agent. CI fails if `skills/` and the copies drift.

## The dev loop

**You do not need to test anything locally.** Edit what you want (for skills, edit under `skills/` — never the generated copies), push, open the PR. CI does the rest:

| CI check | What it validates | If it fails |
|---|---|---|
| `validate` | skill spec (name/description/version), template links, skill self-containment, sync drift, Mermaid diagrams, example-vault wikilinks, issue templates | The failing check's message names the exact file and fix |
| `check` | generated-copy drift + skills-CLI discovery of all three skills | **Drift is auto-fixed**: the bot commits the synced copies to your PR branch — you usually do nothing |

Notes:

- Even the skills-CLI discovery smoke test runs in CI. The only thing left for you is the human part: does the change teach well?
- If a PR changes skill *behavior*, reviewers check that every pi-tool mention still has a plain markdown/chat fallback that works without it.
- Want a fast local pass anyway (optional)? `npm run check` runs the same validator, `npm run sync` fixes drift — but CI will catch both for you.

## Pull requests

- Small and focused. One pack/fix/feature per PR.
- Skills stay **agent-agnostic**: no agent-specific tool may be required, only preferred.
- Vault writes stay under `Learning/` only.
- PR body should include: what changed, how you tested it (which agent), and for behavior changes — a short transcript or note excerpt.
- CI validates everything (see the dev loop above) — merges wait for green checks.

## Reporting issues

Use the issue templates (subject pack request, translation, feature, bug). For anything about your learning content, remember: **we never need your private vault** — a minimal reproduction with fake content is always enough.

## License

By contributing, you agree your contributions are MIT-licensed.
