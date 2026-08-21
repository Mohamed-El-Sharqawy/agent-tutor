---
name: agent-tutor-review
version: 1
description: Spaced-repetition review sessions and retention tracking for subjects learned with the agent-tutor skill. Recall-first practice over lesson notes, interval scheduling (+1d to +90d), honest retention verdicts, and a mixed mini-quiz per session. Use when the user wants to revise or practice old topics, check what they remember, or when the dashboard shows notes up for review.
license: MIT
---

# Agent Tutor — Review

Understanding decays. This skill runs recall-first review sessions and keeps the retention schedule honest.

**Vault root:** `OBSIDIAN_VAULT` env var, else `learning/` in the current workspace. All content under `<vault>/Learning/`.

## The schedule

Every lesson note carries a `review:` field in its frontmatter with upcoming intervals. Standard ladder:

```
+1d → +3d → +7d → +14d → +30d → +90d (then considered durable)
```

After a successful review, advance to the next interval. After a failed review, drop back one interval and flag the note for re-study.

## Running a review session

1. Read `Learning/Dashboard.md` → **Up for review** section (notes whose next review date has passed). If the dashboard looks stale, scan `Learning/<Subject>/notes/*/` frontmatter directly.
2. **Recall first, always.** For each note: ask the user to explain the topic from memory *before* showing anything. ("Explain closures to me as if I'd never heard of them.")
3. Judge the recall against the note's key takeaways, then:
   - **Solid** → advance the interval.
   - **Shaky but recoverable** → show the key takeaways, have them re-explain, advance only if the second attempt is clean.
   - **Gone** → mark for re-study: re-open the lesson, re-teach the gaps, reset the interval to `+1d`.
4. **Interleave**: mix topics from different phases/subjects in one session — interleaving is the point, don't review one phase in isolation.
5. End with a **mixed mini-quiz** (5–8 questions spanning everything reviewed today).
   - If an interactive quiz tool is available (e.g. pi's `quiz`), use it.
   - Otherwise run a chat quiz: one question at a time, wait for the answer, explain why the right option is right, track the score, report pass/fail vs 70% at the end.
6. Update each note's `review:` frontmatter, the Dashboard review queue, and append a session log entry (type `review`) to `Learning/<Subject>/logs/YYYY-MM-DD.md` with per-topic retention verdicts.

## Honesty rules

- Judge recall against the note's key takeaways, not against "close enough".
- Tell the user their actual retention state — "you've forgotten X entirely" is useful information.
- If more than half of a subject's notes fail review, say it plainly and propose a re-teach plan rather than patching holes.

## Dashboard maintenance

Keep the **Up for review** section current: one bullet per due note, sorted by due date:

```
- [[notes/03-closures]] — +7d interval, due 2026-08-24
```

Remove bullets after the review is logged. This list is what the tutor reads at session start, so it must be true.
