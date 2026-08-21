---
type: dashboard
updated: {{DATE}}
tags: [learning, dashboard]
---

# 🎓 Learning Dashboard

> [!info] Control center
> The tutor reads this file at the start of every session. Keep it true.

## 📊 Progress

<!-- Grid: donuts per subject, then completion + forecast. Paths relative to Learning/Dashboard.md -->

| Progress | Completion | Reviews due |
|---|---|---|
| ![]({{subject}}/assets/progress.svg) | ![]({{subject}}/assets/completion.svg) | ![]({{subject}}/assets/forecast.svg) |

## 📚 Active subjects

| Subject | Phase | Progress | Next up | Last activity |
|---|---|---|---|---|
| [[{{subject}}/plan\|{{subject}}]] | {{n}}/{{total}} | {{done}}/{{all}} topics | [[{{next note}}]] | {{date}} |

## 🗓️ Up for review

<!-- One bullet per due note, sorted by due date. Remove after the review is logged. -->

- [[{{subject}}/notes/{{note}}]] — {{interval}} interval, due {{date}}

## ✅ Completed

- {{subject}} — completed {{date}} ([[{{subject}}/plan|plan]])

## 📝 Recent activity

- {{date}} — {{one-line summary of the last session}}
