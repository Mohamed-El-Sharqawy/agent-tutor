---
type: lesson
subject: Rust
phase: 1
topic: Borrowing & references
status: planned
created: 2026-02-21
review:
  interval: 1      # current interval in days
  ease: 2.5        # multiplier applied on a solid recall
  due: 2026-02-22  # next review date
tags: [rust, borrowing, references]
---

> [!abstract] In 3 sentences
> Borrowing lets a function use a value without taking ownership: `&T` for read-only access, `&mut T` for exclusive mutation. The borrow checker enforces one simple rule — any number of readers *or* exactly one writer, never both at once. This is why most "fighting the borrow checker" errors are really aliasing errors wearing a Rust costume.

> [!info] Planned
> This note is written in the next session (topic 1.2 of the [[Rust/plan|plan]]). The Dashboard review queue points here as the up-next topic.
