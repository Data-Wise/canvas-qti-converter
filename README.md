# Examify

<div align="center">

![Examify Hero](https://capsule-render.vercel.app/api?type=waving&color=7C3AED&height=200&section=header&text=Examify&fontSize=90&animation=fadeIn&fontAlignY=35&desc=Beautiful%20Exams,%20Zero%20Friction&descAlignY=55&descSize=20&fontColor=ffffff)

<div style="margin-top: 20px">

[![Version](https://img.shields.io/badge/Examify-v0.4.2-7C3AED?style=for-the-badge&logo=markdown&logoColor=white)](https://github.com/Data-Wise/examify/releases)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-87%20passing-3178C6?style=for-the-badge)](https://github.com/Data-Wise/examify/actions)
[![Docs](https://img.shields.io/badge/docs-online-6366f1?style=for-the-badge)](https://data-wise.github.io/examify/)

</div>

<p align="center" style="font-size: 1.2rem; max-width: 600px; margin: 0 auto; line-height: 1.6;">
  <strong>Transform your Markdown & Quarto documents into Canvas-ready exams.</strong><br>
  No more manual data entry. No more broken images. Just write and publish.
</p>

[📖 Documentation](https://data-wise.github.io/examify/) • [📦 Quarto Extension](https://data-wise.github.io/examify/extensions/quarto/) • [🐛 Report Bug](https://github.com/Data-Wise/examify/issues)

</div>

---

## ⚡ The Ecosystem

Examify isn't just a converter — it's a complete workflow for modern assessment authoring.

| **Examify CLI** | **Quarto Extension** |
|:---:|:---:|
| 💻 **For Developers & Authors** | 🧪 **For Data Scientists** |
| Convert any Markdown file to QTI. | Author in `.qmd` with R/Python code. |
| Automated image bundling. | Dynamic, randomized questions. |
| `examify quiz.md -o quiz.qti.zip` | `quarto render exam.qmd` |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Markdown First

Write questions in simple, clean Markdown. No XML, no GUI clicking. Focus on your content.

</td>
<td width="50%">

### 🧮 LaTeX Native

Full support for inline `$...$` and display `$$...$$` math. We handle the complex conversion to Canvas HTML automatically.

</td>
</tr>
<tr>
<td width="50%">

### 🖼️ Auto-Bundle Images

Reference local images (`![Graph](graph.png)`). We automatically package them with `imsmanifest.xml` so they just work.

</td>
<td width="50%">

### 🎓 Import Emulator

Predict import success *before* you upload. Our emulator validates your package against Canvas strict requirements.

</td>
</tr>
</tr>
<tr>
<td width="50%">

### 🔒 Security Hardened

Built-in protection against XSS and path traversal. We sanitize every input to ensure your exams are safe for LMS deployment.

</td>
<td width="50%">

### 🎯 6 Question Types

Multiple choice, true/false, multiple answer, short answer, essay, and numeric. All Canvas-compatible.

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Installation

Choose your preferred method:

| Method | Command | Notes |
|--------|---------|-------|
| **Try it** | `npx examify quiz.md -o quiz.qti.zip` | No install needed |
| **Mac (Homebrew)** | `brew tap data-wise/tap && brew install examify` | Recommended for Mac |
| **npm** | `npm install -g examify` | Requires Node.js 18+ |
| **Developer** | See below | For contributors |

<details>
<summary><strong>Developer Installation</strong></summary>

```bash
git clone https://github.com/Data-Wise/examify.git
cd examify && npm install && npm run build && npm link
```

</details>

### Create Your Exam

Use a template or write from scratch:

```markdown
# Statistics Quiz

# Section: Multiple Choice

## 1. Which statistical test compares two means? [2 pts]

a) Chi-Square
b) **T-Test** ✓
c) ANOVA
d) Regression

## 2. [TF] Correlation implies causation. → False

## 3. [Essay, 10pts] Explain the Central Limit Theorem.
```

### 3. Convert & Verify

```bash
# Generate QTI Package
examify exam.md -o exam.qti.zip

# Simulate Canvas import
examify emulate-canvas exam.qti.zip
```

### 4. Import to Canvas

Upload `exam.qti.zip` to **Settings → Import Course Content → QTI .zip file**.

---

## 📋 Templates

Start with a ready-made template:

| Template | Questions | Best For |
|:---|:---:|:---|
| [`starter-exam-md.md`](examples/starter-exam-md.md) | 7 | Beginners — one of each question type |
| [`canvas-ready.md`](examples/canvas-ready.md) | 21 | Full feature coverage with math & code |
| [`canvas-validation.md`](examples/canvas-validation.md) | 9 | Testing all features |

**Quarto users:** See [`starter-exam.qmd`](examples/starter-exam.qmd) and [`canvas-export.qmd`](examples/canvas-export.qmd).

---

## 📦 For Quarto Users

If you use RStudio or Quarto, installing our extension is the best way to work.

```bash
# Install the extension
quarto add Data-Wise/examify
```

Then in your YAML header:

```yaml
title: "Final Exam"
format:
  exam-gfm: default  # Generates QTI-ready Markdown
  exam-pdf: default  # Generates printable PDF
exam:
  solutions: false   # Hide solutions for students
```

📖 [Read the Quarto Guide →](https://data-wise.github.io/examify/extensions/quarto/)

---

## 💻 Commands

| Command | Usage | Description |
|:---|:---|:---|
| **Convert** | `examify <file> -o <out.zip>` | Convert Markdown to QTI package |
| **Verify** | `examify verify <zip>` | Validate QTI structure |
| **Emulate** | `examify emulate-canvas <zip>` | Simulate Canvas import |
| **Check** | `examify check <file>` | Lint source file for errors |
| **Preview** | `examify <file> --preview` | Preview parsed questions |

---

## 📚 Documentation

- [**Getting Started**](https://data-wise.github.io/examify/getting-started/) — Install and convert your first exam
- [**Input Formats**](https://data-wise.github.io/examify/formats/) — Complete question syntax reference
- [**Canvas Emulator**](https://data-wise.github.io/examify/emulator/) — Pre-validate before uploading
- [**Quarto Extension**](https://data-wise.github.io/examify/extensions/quarto/) — R/Python integration
- [**Tutorials**](https://data-wise.github.io/examify/tutorials/) — Dynamic exams, VS Code snippets

---

<div align="center">

**[Explore Full Documentation ↗](https://data-wise.github.io/examify/)**

<sub>Built with ❤️ by the MediationVerse Team • Licensed under MIT</sub>

</div>
