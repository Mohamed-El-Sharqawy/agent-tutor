---
type: roadmap
status: active
tags: [roadmap]
---

# Roadmap

> Dogfooding our own format — this is a plan.md with checkboxes. Items are up for grabs; comment on an item or open an issue to claim it.

## Phase 1 — Core tutoring (shipped) ✅

- [x] Intake → phased plan → lesson notes → quizzes → logs
- [x] Honest feedback rules (never inflate; name the misconception)
- [x] Spaced-repetition reviews (FSRS-inspired adaptive intervals, uncapped by default) + review queue on the dashboard
- [x] Diagram standards (Mermaid/SVG) + validators for pi
- [x] Agent-agnostic install (Claude Code, Codex, Cursor, Windsurf, pi, 70+) with CI-enforced sync

## Phase 2 — Personalization & sources (in review)

- [ ] Learner profile: interview + teaching contract → PR #1
- [ ] Source ingestion: learn from URL/PDF/folder/repo → PR #2
- [ ] README repositioning (agent-agnostic × vault-owned) → PR #3
- [ ] Example vault published as homepage → PR #4

## Phase 3 — Retention engine

- [x] **Adaptive review intervals** — shipped in Phase 1: FSRS-inspired scheduling computed from review verdicts (policy change in the skills; no runtime needed)
- [ ] **Teach-back mode** — review variant where the learner explains the topic from memory and the tutor grades against the note
- [ ] **Anki export** — review queue → CSV/.apkg from the vault (spaced-repetition users get a bridge instead of a wall)

## Phase 4 — Reach

- [ ] **Subject packs** — curated starter plans (Rust, Kubernetes, ML, TypeScript, Arabic-for-developers…); designed as the default `good first issue`
- [ ] **Translations** — README + templates: Arabic and Chinese first
- [ ] **Term glossary** — per-subject vocabulary tracker driven by the profile's jargon pacing
- [ ] **Learning-outcome report** — a shareable "what I actually retained" artifact (organic growth loop)

## Success criteria

- [ ] A learner can start from zero in any agent and finish a phase with passing quizzes
- [ ] Reviews feel personal: intervals adapt, tone adapts, honesty never does
- [ ] The vault is the product: everything a learner needs lives in markdown they own
- [ ] 10 external contributors; 5 subject packs; 1k stars

## Progress log

- 2026-08-21 — Roadmap created from `docs/market-research.md`.
