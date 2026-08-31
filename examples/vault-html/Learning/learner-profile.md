---
type: learner-profile
status: active
created: 2026-02-16
updated: 2026-02-19
output_format:
  dashboard: html
  logs: html
tags: [learning, profile]
---

> [!abstract] Who this file is for
> The tutor's brief on the learner: how they think, which explanations they receive best, and the rules every lesson under `Learning/` must follow. Created once, reused for every subject. It is a living document — update it when preferences change or when lessons reveal friction.

## 👤 Snapshot

| | |
|---|---|
| Preferred language | English (native: Arabic — fine to explain an Arabic term in Arabic) |
| Domains known deeply (analogy sources) | JavaScript & web dev, cooking |
| Math & formal notation comfort | basic — okay with small formulas, no proofs |
| Typical session length | 45 min |

## 🧠 How they think

| Axis | Where they sit | Evidence (their words) |
|---|---|---|
| Structure | bottom-up — build from small pieces | "I want to actually understand, not skim the map" |
| Abstraction | concrete examples first, definitions after | "example-first; dislikes walls of theory" |
| Input | visual where it helps, but examples carry the load | "visual where it helps" |
| Pace | steady ladder, occasional stretch | "45 min/day, ~5 days/week" |

## 🎨 Explanations they receive best

- **What makes it click (priority order):** worked example → diagram → analogy → formal definition
- **Analogy domains to borrow:** JavaScript/web dev, cooking
- **Density:** step-by-step, but compact — short sections, no walls of text
- **Tone:** casual · humor: sparingly, technical is fine
- **Jargon:** teach the real Rust terms early (ownership, borrow, lifetime) — each defined on first use
- **Note layout:** callouts & tables; diagrams for anything with structure or flow
- **Self-check style:** predict-the-output mini-exercises

## 🗣️ Feedback & motivation

- **Feedback tone:** direct and blunt — no cheerleading (honesty is never optional, only the wrapping changes)
- **Motivation:** ship a real CLI tool; frustrated by cargo-culting `clone()`
- **Loves:** small wins that compile and run
- **Dislikes / friction:** walls of theory, long analogies that go nowhere

## 📜 Teaching contract

> [!important] Every lesson, quiz, and review must:
> 1. Start with a runnable code example — theory explains the example, never the reverse.
> 2. Map Rust concepts onto JavaScript intuitions first (and flag where JS intuitions break).
> 3. Use a diagram for anything with structure or flow (ownership, borrows, lifetimes).
> 4. Keep notes compact: short sections, tables over prose, depth lives in worked examples.
> 5. Feedback is blunt and short. No cheerleading.

## 🖥️ Output format

- **Dashboard & logs: html.** `Dashboard.html` is the live dashboard (thin `Dashboard.md` hub fronts it), and session logs are styled daily `logs/YYYY-MM-DD.html` fragments. Chosen at intake ("html" — the suggested default). Lessons, plans, and quiz reports stay markdown in every mode.

## 🔍 Observed evidence

- 2026-02-16 — Profile created (intake interview); format answer recorded: dashboard + logs → html.
- 2026-02-19 — Ownership quiz 6/8; JS-analogy callouts got read first, formal sections skimmed → keep examples leading.
