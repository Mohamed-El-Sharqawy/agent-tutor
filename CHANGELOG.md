# Changelog

Notable changes to the agent-tutor skills. The tutor checks its own version at session start by reading the `version:` field of `skills/agent-tutor/SKILL.md` — record every bump here in the same release. Entries before version 6 predate this file.

## 6 — HTML dashboard & logs (2026-08-31)

Dashboards and session logs can now render as styled, self-contained HTML pages — your vault reads as a control center instead of a table dump. **Non-breaking:** a profile without an `output_format` block keeps the classic markdown vault; nothing changes until you opt in.

**The toggle.** One block in `learner-profile.md`, chosen at intake, global across subjects:

```yaml
output_format:
  dashboard: html   # markdown (default) | html
  logs: markdown    # markdown | html
```

- **HTML dashboard** — a Cards-style `Dashboard.html`: stat row, one card per subject with a progress ring, the review queue, and recent activity. Every card links to a per-subject focus page under `subjects/` (ring, due notes, next topics, activity).
- **HTML logs** — styled daily `logs/YYYY-MM-DD.html` entries in the same visual language: time, type badge, title, short body, score line.
- **State stays honest** — the dashboard carries its data in an embedded JSON island the tutor reads in one go at session start; plan checkboxes and note frontmatter remain the only authority. Pages regenerate whole at the usual update moments; no new triggers, no JavaScript.
- **Switching any time** — a markdown → html switch applies at the next dashboard write and keeps your old dashboard as `Dashboard-archive-<date>.md`, linked from the new thin `Dashboard.md` hub. The formats never mix or convert; html → markdown regenerates the full dashboard the same way.
- **Viewing** — open `Dashboard.html` in any browser, or in-vault with the free Obsidian HTML Reader plugin. The tutor mentions the plugin once when html mode starts; installing it is a manual, human-only step. Without it, the thin markdown hub still links everything. Pages are self-contained (inline CSS, no scripts, no external resources) and follow your system light/dark theme.
- **Everywhere the same** — the skill renders the pages from its own templates: zero extension changes, identical behavior on every agent. New validator checks in CI lint every generated page (parsable state island, no scripts, no external references, portable links), and a second sample vault (`examples/vault-html/`) exercises the mode end to end.

Also in this release: the review and visualize skills learned the html dashboard branches, and the README gained an HTML-mode section with a real screenshot. Sample lesson notes, plans, and quiz reports stay markdown in every mode — tokens go into content, not markup.
