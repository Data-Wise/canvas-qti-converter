# Examify

**Create exams from Markdown and export to Canvas QTI format.**

[![Version](https://img.shields.io/badge/version-0.4.2-6366f1?style=for-the-badge)](https://github.com/Data-Wise/examify/releases)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](https://github.com/Data-Wise/examify/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-≥18-3178C6?style=for-the-badge)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-48_passing-22C55E?style=for-the-badge)](https://github.com/Data-Wise/examify/actions)

---

## ✨ Features

<div class="grid cards" markdown>

- :material-file-document-edit:{ .lg .middle } **Markdown First**

    ---

    Write questions in simple, readable Markdown. Focus on content, not formatting.

- :material-math-integral:{ .lg .middle } **LaTeX Math**

    ---

    Full equation support with `$...$` inline and `$$...$$` display math.

- :material-image-multiple:{ .lg .middle } **Image Bundling**

    ---

    Automatically packages images into Canvas-ready QTI with proper manifests.

- :material-shield-check:{ .lg .middle } **Canvas Emulator**

    ---

    Predict import success *before* uploading. Catch errors early.

- :material-format-list-checks:{ .lg .middle } **6 Question Types**

    ---

    Multiple choice, true/false, multiple answer, essay, short answer, and numeric.

- :material-language-python:{ .lg .middle } **Quarto Integration**

    ---

    Use with R/Python for dynamic, randomized exam generation.

</div>

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Data-Wise/examify.git
cd examify
npm install && npm run build && npm link

# Convert your first quiz
examify quiz.md -o quiz.qti.zip

# Verify before upload
examify emulate-canvas quiz.qti.zip
```

[Get Started :material-arrow-right:](getting-started.md){ .md-button .md-button--primary }
[View on GitHub :material-github:](https://github.com/Data-Wise/examify){ .md-button }

---

## 📝 Example

=== "Input (Markdown)"

    ```markdown
    # Statistics Quiz

    # Section: Multiple Choice

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
    A[quiz.md] --> B[examify]
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

| Template | Questions | Best For |
|----------|-----------|----------|
| [`starter-exam-md.md`](https://github.com/Data-Wise/examify/blob/main/examples/starter-exam-md.md) | 7 | Beginners |
| [`canvas-ready.md`](https://github.com/Data-Wise/examify/blob/main/examples/canvas-ready.md) | 21 | Full feature coverage |
| [`canvas-validation.md`](https://github.com/Data-Wise/examify/blob/main/examples/canvas-validation.md) | 9 | Testing all features |

**Quarto Users:** Check out the [Quarto Extension](extensions/quarto.md) for `.qmd` templates with R/Python code.

---

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `examify file.md -o output.qti.zip` | Convert Markdown to QTI package |
| `examify verify package.qti.zip` | Validate package structure |
| `examify emulate-canvas package.qti.zip` | Simulate Canvas import |
| `examify check file.md` | Lint input file for errors |
| `examify file.md --preview` | Preview parsed questions |

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
