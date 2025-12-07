# Examify

<div class="hero-section" markdown>

<div class="hero-badges" markdown>
[![Version](https://img.shields.io/badge/version-0.4.0-7C3AED?style=for-the-badge)](https://github.com/Data-Wise/examify/releases)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](https://github.com/Data-Wise/examify/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-≥18-3178C6?style=for-the-badge)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-32_passing-22C55E?style=for-the-badge)](https://github.com/Data-Wise/examify/actions)
</div>

<div class="hero-tagline" markdown>
## 🚀 Create Beautiful Exams from Markdown

**Transform your plain text questions into Canvas-ready quiz packages in seconds.**  
No XML. No hassle. Just Markdown.
</div>

</div>

---

## ✨ Features

<div class="grid cards" markdown>

- :material-file-document-edit:{ .lg .middle .feature-icon } **Markdown First**

    ---

    Write questions in simple, readable Markdown. Focus on content, not formatting.

- :material-math-integral:{ .lg .middle .feature-icon } **LaTeX Math**

    ---

    Full equation support with `$...$` inline and `$$...$$` display math.

- :material-image-multiple:{ .lg .middle .feature-icon } **Image Bundling**

    ---

    Automatically packages images into Canvas-ready QTI with proper manifests.

- :material-shield-check:{ .lg .middle .feature-icon } **Canvas Emulator**

    ---

    Predict import success *before* uploading. Catch errors early.

- :material-format-list-checks:{ .lg .middle .feature-icon } **6 Question Types**

    ---

    Multiple choice, true/false, multiple answer, essay, short answer, and numeric.

- :material-flash:{ .lg .middle .feature-icon } **Fast & Reliable**

    ---

    Built with TypeScript. Comprehensive test suite with 32 tests passing.

</div>

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/Data-Wise/examify.git
cd examify
npm install && npm run build && npm link

# Convert your first quiz
examify quiz.md -o scratch/quiz.qti.zip
```

---

## 📝 Example

=== "Input (Markdown)"

    ```markdown
    # Pool: Statistics Quiz

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
    ✓ Generated QTI Package: scratch/quiz.qti.zip
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

## 🆕 What's New in v0.4.0

!!! success "Latest Release"
    - **📦 Image Bundling** — Images properly packaged with `imsmanifest.xml`
    - **🎨 Project Rename** — Now called **Examify**!
    - **🔍 Enhanced Emulator** — Validates QTI 1.2 packages
    - **✅ Canvas Tested** — Verified imports into Canvas LMS

---

<div class="cta-buttons" markdown>

[Get Started :material-arrow-right:](quickstart.md){ .md-button .md-button--primary .md-button--lg }
[View on GitHub :material-github:](https://github.com/Data-Wise/examify){ .md-button .md-button--lg }

</div>
