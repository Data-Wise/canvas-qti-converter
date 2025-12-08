# Examify

**Create exams from Markdown and export to Canvas QTI format.**

[![Version](https://img.shields.io/badge/version-0.4.0-6366f1?style=for-the-badge)](https://github.com/Data-Wise/examify/releases)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](https://github.com/Data-Wise/examify/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-≥18-3178C6?style=for-the-badge)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-35_passing-22C55E?style=for-the-badge)](https://github.com/Data-Wise/examify/actions)

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

- :material-flash:{ .lg .middle } **Fast & Reliable**

    ---

    Built with TypeScript. Comprehensive test suite with 35 tests passing.

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
```

---

## 📝 Example

=== "Input (Markdown)"

    ```markdown
    # Statistics Quiz

    # Section: Multiple Choice

    ## 1. What is the mean of 2, 4, 6? [2 pts]

    1)  Three
    2)  **Four** ✓
    3)  Five
    
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

## 🎯 Commands

| Command | Description |
|---------|-------------|
| `examify file.md -o output.qti.zip` | Convert Markdown to QTI package |
| `examify verify package.qti.zip` | Validate package structure |
| `examify emulate-canvas package.qti.zip` | Simulate Canvas import |
| `examify check file.md` | Lint input file for errors |
| `examify file.md --preview` | Preview parsed questions |

---

## 📚 Documentation

- [Getting Started](getting-started.md) — Installation and first quiz
- [Commands Reference](reference.md) — All CLI options
- [Input Formats](formats.md) — Question syntax guide
- [Troubleshooting](troubleshooting.md) — Common issues and fixes

---

## 🤝 Contributing

See the [Contributing Guide](contributing.md) for development setup and guidelines.

---

## 📄 License

MIT © [Data-Wise](https://github.com/Data-Wise)

---

[Get Started :material-arrow-right:](getting-started.md){ .md-button .md-button--primary }
[View on GitHub :material-github:](https://github.com/Data-Wise/examify){ .md-button }
