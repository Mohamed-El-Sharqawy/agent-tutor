name: 💡 Feature request
description: Suggest an improvement to the tutoring loop, templates, or extensions
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem does this solve for a learner?
      description: Problems first, solutions second.
    validations:
      required: true
  - type: textarea
    id: idea
    attributes:
      label: Your idea
  - type: checkboxes
    id: constraints
    attributes:
      label: Constraints you accept (project ground rules)
      options:
        - label: Skills stay agent-agnostic (no agent-specific tool required, only preferred)
        - label: Writes stay under Learning/ in the vault
