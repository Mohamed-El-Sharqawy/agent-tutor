---
type: quiz-report
subject: Rust
topic: 1.1 Ownership & moves
date: 2026-02-19
score: 6/8
percent: 75
passed: true
tags: [quiz, rust, ownership]
---

> [!success] Result: 6/8 (75%) — Passed ✅

## ✅ What went well
- Move semantics on assignment (Q1, Q3) — solid, no hesitation
- Scope-based drops and drop order (Q6)
- Reading E0382 and locating the moved-from binding (Q7)

## ❌ Gaps found

| # | Question focus | Your answer | Correct answer |
|---|---|---|---|
| 4 | `Copy` vs move for `(i32, String)` | "whole tuple copies" | tuple moves — `String` isn't `Copy` |
| 8 | Return-value ownership transfer | "need `&mut` to hand it back" | return the value; ownership moves out |

> [!danger] Honest feedback
> Q4 is a **rule gap**: `Copy` composes — a tuple is `Copy` only if *every* element is. You applied "tuple of numbers-ish stuff" intuition. Re-read the Copy section and check `Vec<String>` vs `[i32; 4]` mentally: ask "does any element own heap data?"
> Q8 is a **model gap**, and it matters more: you reached for `&mut` when the natural tool is returning ownership. Functions that produce values should *return* them — that's the whole point of moves being cheap metadata updates. This misconception will bite in Phase 2 (builders, `into()`).
> This is passing, not comfortable. Both gaps are fixable before the phase quiz.

## 📌 Action items
- [ ] Re-read notes/01-ownership-model.md — "Copy" paragraph + pitfall 2
- [ ] Exercise: 5 signatures — decide `Copy`, move, or borrow; write predicted errors first
- [ ] Re-quiz weak areas after topic 1.2

**Next review:** 2026-02-20 (+1d interval)
