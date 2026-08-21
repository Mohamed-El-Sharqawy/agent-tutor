name: 📦 Subject pack request
description: Request or contribute a curated starter plan for a subject
labels: ["subject-pack", "good first issue"]
body:
  - type: input
    id: subject
    attributes:
      label: Subject
      placeholder: e.g. Kubernetes fundamentals, Modern Arabic for developers
    validations:
      required: true
  - type: textarea
    id: audience
    attributes:
      label: Who is it for? (level, background)
      placeholder: e.g. backend devs who never touched k8s
  - type: textarea
    id: scope
    attributes:
      label: What should the learner be able to DO at the end?
      description: Success criteria, not topic lists — the plan grows from these.
  - type: checkboxes
    id: contribution
    attributes:
      label: Are you willing to draft it?
      options:
        - label: Yes, I'll open a PR (see CONTRIBUTING.md — it's one markdown file)
