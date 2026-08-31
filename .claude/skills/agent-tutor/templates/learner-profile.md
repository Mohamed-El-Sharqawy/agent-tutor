---
type: learner-profile
status: active
created: {{DATE}}
updated: {{DATE}}
tags: [learning, profile]
# output_format:        # written explicitly at intake (question 11) — absent in old profiles = markdown everywhere
#   dashboard: html     # markdown | html — Cards-style self-contained dashboard
#   logs: html          # markdown | html — styled daily log entries
---

> [!abstract] Who this file is for
> The tutor's brief on the learner: how they think, which explanations they receive best, and the rules every lesson under `Learning/` must follow. Created once, reused for every subject. It is a living document — update it when preferences change or when lessons reveal friction.

## 👤 Snapshot

| | |
|---|---|
| Preferred language | {{e.g. English / Arabic explanations with English terms}} |
| Domains known deeply (analogy sources) | {{e.g. web dev, cooking, football, cars, music}} |
| Math & formal notation comfort | {{none / basic / comfortable / fluent}} |
| Typical session length | {{e.g. 45 min}} |

## 🧠 How they think

| Axis | Where they sit | Evidence (their words) |
|---|---|---|
| Structure | top-down ↔ bottom-up | {{quote}} |
| Abstraction | concrete examples ↔ formal definitions | {{quote}} |
| Input | visual ↔ verbal ↔ hands-on | {{quote}} |
| Pace | steady ↔ challenged hard | {{quote}} |

## 🎨 Explanations they receive best

- **What makes it click (priority order):** {{analogies / diagrams / worked examples / step-by-step derivations}}
- **Analogy domains to borrow:** {{from snapshot above}}
- **Density:** {{compact & dense ↔ step-by-step & leisurely}}
- **Tone:** {{casual ↔ formal}} · humor: {{yes / no / sparingly}}
- **Jargon:** {{teach real terms early ↔ keep plain language as long as possible}}
- **Note layout:** {{callouts & tables ↔ flowing prose}} · diagrams: {{whenever structure exists / sparingly}}
- **Self-check style:** {{recall questions ↔ mini-exercises}}

## 🗣️ Feedback & motivation

- **Feedback tone:** {{direct and blunt ↔ warm but honest}} (honesty is never optional — only the wrapping changes)
- **Motivation:** {{curiosity / deadline / project / career}}
- **Loves:** {{e.g. ticking off small wins, streaks, hard problems}}
- **Dislikes / friction:** {{e.g. walls of text, cold-call quizzes, too many metaphors}}

## 📜 Teaching contract

> [!important] Every lesson, quiz, and review must:
> 1. {{Rule derived from the profile — e.g. "Open with the big picture before any detail."}}
> 2. {{e.g. "Every new concept gets an analogy from the learner's domains before the formal definition."}}
> 3. {{e.g. "Diagrams for anything with structure or flow."}}
> 4. {{e.g. "Notes stay compact — depth goes into worked examples, not prose."}}
> 5. {{e.g. "Feedback is blunt and short. No cheerleading."}}

## 🔁 Review policy (optional)

<!-- Delete this section to accept the FSRS-style defaults: initial interval 1d, ease 2.5, min_ease 1.3, max_ease 3.5, no maximum interval, ±5% fuzz. -->

```yaml
review_policy:
  scheduler: fsrs-inspired
  initial_interval: 1   # days after first learning / after a lapse
  ease: 2.5             # interval multiplier on a solid recall
  min_ease: 1.3
  max_ease: 3.5
  max_interval: null    # null = unbounded; set a number of days to cap growth
  fuzz: true            # ±5% jitter on computed due dates
```

## 🔍 Observed evidence

<!-- Micro-diagnostic notes and behavior observed during lessons — what worked, what caused friction. -->
- {{DATE}} — Profile created (intake interview).
