---
type: dashboard
updated: {{DATE}}
tags: [learning, dashboard]
---

# 🎓 Learning Dashboard

> [!info] HTML mode
> The live dashboard is `Dashboard.html` — a self-contained page the tutor regenerates whole at every update. Open it with the Obsidian **HTML Reader** plugin, or in any browser. This hub is only a signpost — the tutor never reads it; its state lives inside the HTML.

**Open the dashboard:** [Dashboard.html](Dashboard.html)

- **Active subjects:** {{n}}
- **Notes due for review:** {{due}}
- **Updated:** {{DATE}}

**Subject pages:** <!-- one line per active subject, matching the overview cards -->
[{{subject}}](subjects/{{subject-slug}}.html) · [lesson board](../{{subject}}/board.html) <!-- ../{{subject}}/ = the subject's real folder name, URL-encode spaces -->

**Markdown archive:** [Dashboard-archive-{{ARCHIVE_DATE}}.md](Dashboard-archive-{{ARCHIVE_DATE}}.md) — the full markdown dashboard kept when html mode started.
<!-- Include the archive line only when a dated archive exists (markdown → html switch); remove it otherwise. -->

<!-- Thin hub (html mode only): links to the generated pages. Never a parallel dashboard — progress and scheduling stay in plan.md, note frontmatter, and the Dashboard.html state island. -->
