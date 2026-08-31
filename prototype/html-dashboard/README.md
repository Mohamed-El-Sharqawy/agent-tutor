# Prototype: HTML dashboard & log entries

**Question** (wayfinder ticket [Dashboard & log visual design](https://github.com/Mohamed-El-Sharqawy/agent-tutor/issues/21)): what should the HTML dashboard and log entries look like, and in which rendering target?

Three structurally different dashboard variants + one log-fragment sample, all self-contained (inline CSS, **no JavaScript**, no external resources) so they render identically in:

- the **HTML Reader** plugin inside Obsidian (copy any file into your vault and open it), and
- any **external browser** (just open the file).

## Variants

| File | Structure | Idea |
|---|---|---|
| `dashboard-a.html` | **A · Cards** | Stats row, per-subject cards with SVG progress rings, review list, activity. The "classic dashboard". |
| `dashboard-b.html` | **B · Ledger** | Single dense document: standfirst numbers, subject table with inline progress bars, urgent due-box, record of activity. Reads like a broadsheet. |
| `dashboard-c.html` | **C · Focus** | App shell: subject rail, "today" helloline, due-now panel, next-up cards, activity feed. Tells you what to do next. |

A floating **PROTOTYPE** bar at the bottom links between them; `log-entry-sample.html` shows the appended-fragment log styling.

All variants carry the decided constraints:

- an embedded `<!-- agent-tutor-state: {json} -->` data island (first thing in `<body>`) — the agent's single read at session start;
- dark/light adaptation via `prefers-color-scheme` + `color-scheme` meta (charts use CSS-variable strokes so they re-theme);
- fake but realistic data (2 subjects, 3 due notes, activity history).

## How to view

1. **Browser**: open any file directly — the bar switches variants.
2. **In-vault (HTML Reader)**: copy the three dashboard files into your vault, open one in Obsidian with the HTML Reader plugin enabled. Note: the link bar still works (plain links); colors follow Obsidian's theme only if the plugin respects `prefers-color-scheme`.

## React to

- Which structure (or which mix — "B's table with C's today-line")?
- Which rendering target feels right day-to-day: in-vault via HTML Reader, or click-through to the browser?
- Anything missing on the dashboard? Anything redundant?
