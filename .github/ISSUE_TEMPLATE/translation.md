name: 🌍 Translation
description: Translate the README (or templates) into another language
labels: ["translation", "good first issue"]
body:
  - type: input
    id: language
    attributes:
      label: Language
    validations:
      required: true
  - type: dropdown
    id: what
    attributes:
      label: What are you translating?
      options:
        - README only
        - README + templates (callout text, guidance)
        - Other (say below)
  - type: checkboxes
    id: terms
    attributes:
      label: Style agreement
      options:
        - label: I will keep technical terms (vault, skill, spaced repetition…) in English where the community uses them in English
