---
type: plan
subject: Rust
status: in-progress
created: 2026-02-16
target: open-ended
tags: [learning, plan, rust]
---

> [!goal] Goal
> Read and write idiomatic Rust without fighting the borrow checker — ship a small CLI tool from scratch.

## 🎯 Why this subject
> "I keep bouncing off Rust because the compiler errors confuse me. I want to actually understand ownership instead of cargo-culting `clone()` everywhere."

## 📋 Intake summary

| Question | Answer |
|---|---|
| Current level | some exposure (read the book once, 6 months ago) |
| Time budget | 45 min/day, ~5 days/week |
| Deadline | open-ended, but want the CLI tool done "in a month or so" |
| Preferences | example-first, visual where it helps; dislikes walls of theory |

## 🗺️ Phases

### Phase 1 — Ownership & Borrowing ({{~6h}})
> [!success] Phase goal
> Predict whether a snippet compiles, and explain *why* — in ownership terms.

- [x] 1.1 Ownership & moves → `notes/01-ownership-model.md`
- [ ] 1.2 Borrowing & references → `notes/02-borrowing.md`
- [ ] 1.3 Lifetimes (the 80% you actually need) → `notes/03-lifetimes.md`
- [ ] 1.4 Slices & the string family → `notes/04-slices-strings.md`
- [ ] Phase 1 quiz (pass ≥ 70%)

### Phase 2 — Structuring Programs ({{~6h}})
> [!success] Phase goal
> Model a small domain with structs, enums, traits, and impl blocks.

- [ ] 2.1 Structs & enums → `notes/05-structs-enums.md`
- [ ] 2.2 Traits & generics → `notes/06-traits-generics.md`
- [ ] 2.3 Error handling: Result, ?, thiserror → `notes/07-errors.md`
- [ ] Phase 2 quiz (pass ≥ 70%)

### Phase 3 — The Ecosystem ({{~4h}})
> [!success] Phase goal
> Set up and navigate a real project confidently.

- [ ] 3.1 Cargo workspaces & features → `notes/08-cargo.md`
- [ ] 3.2 Testing & docs → `notes/09-testing.md`
- [ ] Phase 3 quiz (pass ≥ 70%)

### Phase 4 — Build: CLI Tool ({{~8h}})
> [!success] Phase goal
> Ship a working note-taking CLI with clap, persistence, and tests.

- [ ] 4.1 Design & skeleton
- [ ] 4.2 Core commands
- [ ] 4.3 Persistence + tests
- [ ] Final assessment ≥ 80%

## ✅ Success criteria
- [ ] Explain ownership to a JS developer in 5 minutes
- [ ] Predict compile/pass on 8/10 borrow-checker snippets
- [ ] Final assessment ≥ 80%
- [ ] CLI tool merged to personal bin

## 📈 Progress log
- 2026-02-16 — Plan created.
- 2026-02-19 — Topic 1.1 done, quiz 75%.
