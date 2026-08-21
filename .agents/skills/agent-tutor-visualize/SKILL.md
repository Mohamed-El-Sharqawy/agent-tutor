---
name: agent-tutor-visualize
description: Build diagrams and visual explanations for learning notes - Mermaid diagram selection and syntax rules plus SVG illustration guidelines for lesson notes in a markdown vault. Use when a concept needs a picture such as flows, hierarchies, timelines, comparisons, or spatial layouts, and when creating or embedding diagrams in lesson notes.
license: MIT
---

# Agent Tutor — Visualize

Good visuals are not decoration — they encode structure that text can't. Use this skill whenever a lesson note would benefit from a picture.

**Vault root:** `OBSIDIAN_VAULT` env var, else `learning/` in the current workspace. Subject assets go to `<vault>/Learning/<Subject>/assets/`.

## 1. Choose the right form

| The concept is... | Use | Mermaid type |
|---|---|---|
| A process, flow, or decision | Flowchart | `flowchart LR` / `TB` |
| A taxonomy or breakdown | Mind map | `mindmap` |
| Interactions over time | Sequence diagram | `sequenceDiagram` |
| A chronology or evolution | Timeline | `timeline` |
| System structure / behavior | Class / state diagram | `classDiagram`, `stateDiagram-v2` |
| Data relationships | ER diagram | `erDiagram` |
| A 2×2 comparison of options | Quadrant chart | `quadrantChart` |
| Proportions | Pie chart | `pie` |
| Side-by-side feature comparison | **Table** (not a diagram) | — |
| A spatial layout, annotated figure, or custom illustration | **SVG** | — |

If none fits, don't force it. A crisp table often beats a mediocre diagram.

## 2. Mermaid rules

1. **Validate before embedding.** If a `mermaid_lint` tool is available, run it on the code and fix all errors. Otherwise self-check against this list (and prefer simple constructs — they render everywhere).
2. Keep it under **~15 nodes**. Split into two diagrams if needed.
3. Short labels (< 20 chars). Detail belongs in the note text, not in boxes.
4. Direction: `LR` for pipelines/steps, `TB` for hierarchies and mindmaps.
5. Quote labels containing special characters: `A["Node (with parens)"]`.
6. Renderers support core Mermaid only — no `init` directives, no plugins, no icon packs, no HTML inside labels (except `<br/>`).
7. One diagram per idea. A diagram that needs a paragraph of explanation is too complicated.

Embed directly in the note:

````
```mermaid
flowchart LR
    A[Input] --> B{Decision}
    B -- yes --> C[Path 1]
    B -- no --> D[Path 2]
```
````

## 3. SVG rules

Use SVG when Mermaid can't express it: spatial layouts, annotated figures, simple scenes, custom concept maps with precise positioning.

1. **If an `svg_save` tool is available**, use it — it validates the markup and writes to `<vault>/Learning/<Subject>/assets/<name>.svg`. Otherwise write the file yourself after checking the requirements below.
2. Requirements: `xmlns` attribute, `viewBox`, `width="100%"`, `font-size ≥ 14`, inline attributes only (no CSS classes), transparent background, works on light **and** dark themes. Security: no `<script>` elements, no `<foreignObject>`, no references to remote URLs (no external `href`). SVG files are static pictures only.
3. Embed with a relative link or wikilink to `Learning/<Subject>/assets/<name>.svg`.
4. Keep it under ~100 elements. Simple shapes + text beat elaborate art every time.

## 4. Dashboard charts

The Dashboard is not a report. Text tables carry the data (links, dates), charts carry the state at a glance. Every chart below is plain text an agent can write — no plugins, no dependencies:

| Chart | Form | Use | Renders in |
|---|---|---|---|
| Per-subject progress | **SVG donut** | % of topics complete, phase number | Everywhere (Obsidian, GitHub, browsers) |
| Topic completion | Mermaid `pie` | done vs remaining, per subject or total | Obsidian, GitHub |
| Review forecast | Mermaid `xychart-beta` | notes due per day, next 7–14 days | Obsidian 1.5+, GitHub (fallback: table) |

### SVG donut recipe

Deterministic, ~15 elements. One donut per subject, saved to `<subject>/assets/progress.svg`, embedded at the top of the Dashboard:

- Circle `r="45"`, `stroke-width="16"`, `fill="none"`.
- Track circle: full ring, muted gray (`stroke="#555"`).
- Progress arc: same radius, accent color, `stroke-dasharray="<dash> <C-dash>"` where `C = 2·π·45 ≈ 282.7` and `dash = C · fraction`. Rotate `-90°` around center so it starts at 12 o'clock.
- Center text: the percentage (font-size ≥ 28). Label under the donut: `Subject — n/m topics, Phase k`.
- Obey the SVG rules in section 3 (transparent background, no scripts, light+dark safe colors).

### Mermaid pie

```mermaid
pie showData
    title Topic completion — <Subject>
    "Completed" : <n>
    "Remaining" : <m>
```

Keep 2–3 slices. More slices → use a table.

### Review forecast

```mermaid
xychart-beta
    title "Reviews due — next 7 days"
    x-axis ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    y-axis "Notes due" 0 --> 4
    bar [1, 2, 0, 0, 1, 0, 0]
```

Scale the y-axis to one above the max bar. If the renderer does not support `xychart-beta`, keep the **Up for review** table as the fallback and omit the chart.

Update the charts whenever the tables change — a dashboard with stale charts is worse than text.

## 5. Delegating to subagents

If the agent supports delegation/subagents (e.g. pi's `subagent` tool with `mermaid-maker` / `svg-maker` agents, or Claude Code subagents), hand off complex or high-effort visuals so the main conversation stays focused:

- Pass the concept, the audience level, and relevant note content.
- Review and validate the returned diagram before embedding.

The diagram and illustration work can run in parallel when a lesson needs both.

## 6. Placement in notes

- Diagram goes right after the concept it explains — never in an "appendix" at the bottom.
- Give every visual a one-line caption explaining what to notice (`*Figure: notice how X feeds back into Y*`).
- Reference the figure in the text ("as shown below").
