# Examark

**Create exams from Markdown and export to Canvas QTI format.**

[![npm](https://img.shields.io/npm/v/examark?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/examark)
[![CI](https://img.shields.io/github/actions/workflow/status/Data-Wise/examark/ci.yml?style=flat-square&logo=github&label=CI)](https://github.com/Data-Wise/examark/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/Data-Wise/examark/publish_docs.yml?style=flat-square&logo=github&label=Docs)](https://github.com/Data-Wise/examark/actions/workflows/publish_docs.yml)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=flat-square)](https://github.com/Data-Wise/examark/blob/main/LICENSE)

[Get Started :material-arrow-right:](getting-started.md){ .md-button .md-button--primary }
[View on GitHub :material-github:](https://github.com/Data-Wise/examark){ .md-button }

---

## ✨ Features

<div class="grid cards" markdown>

- :material-file-document-edit:{ .lg .middle } **Markdown First**

    ---

    Write questions in simple, readable Markdown. Clean syntax without headers for better HTML/PDF output.

- :material-math-integral:{ .lg .middle } **LaTeX Math**

    ---

    Full equation support with `$...$` inline and `$$...$$` display math.

- :material-image-multiple:{ .lg .middle } **Image Bundling**

    ---

    Automatically packages images into Canvas-ready QTI with proper manifests.

- :material-shield-check:{ .lg .middle } **Canvas Emulator**

    ---

    Predict import success *before* uploading. Catch errors early.

- :material-format-list-checks:{ .lg .middle } **8 Question Types**

    ---

    Multiple choice, true/false, multiple answer, essay, short answer, numeric, matching, and fill-in-blanks.

- :material-printer:{ .lg .middle } **Multiple Export Formats**

    ---

    Export to Canvas QTI or plain text for printable paper exams.

- :material-language-python:{ .lg .middle } **Quarto Integration**

    ---

    Use with R/Python for dynamic, randomized exam generation.

- :material-folder-multiple:{ .lg .middle } **Batch Conversion**

    ---

    Convert multiple files at once with glob patterns: `examark *.md -o output/`

</div>

---

## 🚀 Quick Start

```bash
# No install needed!
npx examark quiz.md -o quiz.qti.zip

# Or install globally
npm install -g examark
examark quiz.md -o quiz.qti.zip
```

---

## 📝 Example

=== "Clean Syntax (Recommended)"

    ```markdown
    # Statistics Quiz

    1. [MC] What is the mean of 2, 4, 6? [2pts]
    a) Three
    b) Four [x] // Correct answer
    c) Five

    2. [TF] Variance can be negative. [1pt]
    a) True
    b) False [x]

    3. [Essay, 5pts] Explain the Central Limit Theorem.
    ```

=== "Traditional Syntax"

    ```markdown
    # Statistics Quiz

    ## 1. What is the mean of 2, 4, 6? [2 pts]
    a) Three
    b) **Four** ✓
    c) Five

    ## 2. [TF] Variance can be negative. → False

    ## 3. [Essay, 5pts] Explain the Central Limit Theorem.
    ```

=== "Output"

    ```text
    ✓ Generated QTI Package: quiz.qti.zip
      • 3 questions (MC, TF, Essay)
      • 1 section
      • 0 images bundled

    ✅ Ready for Canvas import!
    ```

---

## 🎯 Workflow

```mermaid
graph LR
    A[quiz.md] --> B[examark]
    B --> C[quiz.qti.zip]
    C --> D[Canvas Import]
    B --> E[emulate-canvas]
    E -->|✅ Success| D
    E -->|❌ Errors| F[Fix Issues]
    F --> A
```

---

## 📚 Templates

Start with a ready-made template:

**Markdown (no Quarto needed):**

| Template | Questions | Best For |
|----------|-----------|----------|
| [`minimal.md`](https://github.com/Data-Wise/examark/blob/main/templates/markdown/minimal.md) | 3 | Quickest start |
| [`starter.md`](https://github.com/Data-Wise/examark/blob/main/templates/markdown/starter.md) | 6 | Beginners |
| [`all-question-types.md`](https://github.com/Data-Wise/examark/blob/main/templates/markdown/all-question-types.md) | 15+ | All 8 question types |

**Quarto (R/Python):** See the [Quarto Extension](extensions/quarto.md) for `.qmd` templates with dynamic code chunks.

---

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `examark file.md -o output.qti.zip` | Convert Markdown to QTI package |
| `examark file.md -f text` | Export as printable plain text |
| `examark *.md -o output/` | Batch convert multiple files |
| `examark verify package.qti.zip` | Validate package structure |
| `examark emulate-canvas package.qti.zip` | Simulate Canvas import |
| `examark check file.md` | Lint input file for errors |
| `examark file.md --preview` | Preview parsed questions |

See [Commands Reference](reference.md) for all options.

---

## 📖 Documentation

<div class="grid cards" markdown>

- :material-rocket-launch:{ .lg .middle } **[Getting Started](getting-started.md)**

    Installation and your first quiz in 5 minutes.

- :material-format-list-bulleted:{ .lg .middle } **[Input Formats](formats.md)**

    Complete question syntax reference.

- :material-test-tube:{ .lg .middle } **[Canvas Emulator](emulator.md)**

    Pre-validate before uploading.

- :material-school:{ .lg .middle } **[Tutorials](tutorials/index.md)**

    R/Quarto integration and more.

</div>

---

## 🤝 Contributing

See the [Contributing Guide](contributing.md) for development setup and guidelines.

---

## 📄 License

MIT © [Data-Wise](https://github.com/Data-Wise)
