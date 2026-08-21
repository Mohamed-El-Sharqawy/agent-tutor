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
| 🔁 **Review scheduling** | The review ladder is fixed (+1d→+90d). SM-2/FSRS-style adaptive intervals are a wanted, well-scoped change. | `enhancement` |
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

```bash
# 1. Edit files under skills/  (never the generated copies)

# 2. Re-sync the generated copies
node scripts/sync-skills.mjs

# 3. Smoke test — the skills CLI must discover all three skills
npx -y skills@latest add . --list
```

If you changed a skill's behavior, also check the plain fallback path (no pi tools): every pi-tool mention in a skill must have a markdown/chat fallback that works without it.

## Pull requests

- Small and focused. One pack/fix/feature per PR.
- Skills stay **agent-agnostic**: no agent-specific tool may be required, only preferred.
- Vault writes stay under `Learning/` only.
- PR body should include: what changed, how you tested it (which agent), and for behavior changes — a short transcript or note excerpt.
- CI must pass (it checks sync drift + skill discovery).

## Reporting issues

Use the issue templates (subject pack request, translation, feature, bug). For anything about your learning content, remember: **we never need your private vault** — a minimal reproduction with fake content is always enough.

## License

By contributing, you agree your contributions are MIT-licensed.
