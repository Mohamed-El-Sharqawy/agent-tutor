---
type: quiz-report
subject: {{SUBJECT}}
topic: {{TOPIC_OR_PHASE}}
date: {{DATE}}
score: {{CORRECT}}/{{TOTAL}}
percent: {{PERCENT}}
passed: {{TRUE_FALSE}}
tags: [quiz, {{subject-tag}}]
---

> [!{{success-if-passed-otherwise-warning}}] Result: {{CORRECT}}/{{TOTAL}} ({{PERCENT}}%) — {{Passed ✅ / Needs work ❌}}

## ✅ What went well
- {{Topics demonstrated solid}}

## ❌ Gaps found

| # | Question focus | Your answer | Correct answer |
|---|---|---|---|
| {{n}} | {{concept}} | {{wrong choice}} | {{right choice}} |

> [!danger] Honest feedback
> {{Direct and specific. Name the exact misconception behind each miss. Distinguish recall problems from understanding problems. No sugar-coating.}}

## 📌 Action items
- [ ] {{Re-read notes/NN-topic.md — section X}}
- [ ] {{Exercise / applied task}}
- [ ] {{Re-quiz weak areas after fix}}

**Next review:** {{next review date}}
