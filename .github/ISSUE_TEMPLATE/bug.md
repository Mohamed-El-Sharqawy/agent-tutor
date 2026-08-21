name: 🐛 Bug report
description: The tutor did something wrong or surprising
labels: ["bug"]
body:
  - type: input
    id: agent
    attributes:
      label: Which agent?
      placeholder: Claude Code / Codex / Cursor / Windsurf / pi / other
    validations:
      required: true
  - type: input
    id: skill
    attributes:
      label: Skill + version
      description: From the SKILL.md frontmatter of the skill involved
      placeholder: agent-tutor v4
  - type: textarea
    id: what
    attributes:
      label: What happened vs. what you expected
      description: Paste the relevant note/chat as text. Never paste private vault content — fake content is always enough.
    validations:
      required: true
