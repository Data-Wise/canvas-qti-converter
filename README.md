# Examify

<div align="center">

![Examify Hero](https://capsule-render.vercel.app/api?type=waving&color=7C3AED&height=180&section=header&text=Examify&fontSize=80&animation=fadeIn&fontAlignY=38&desc=Write%20Exams%20in%20Markdown.%20Export%20to%20Canvas.&descAlignY=58&descSize=18&fontColor=ffffff)

[![npm](https://img.shields.io/npm/v/examify?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/examify)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-107%20passing-3178C6?style=for-the-badge)](https://github.com/Data-Wise/examify/actions)
[![Docs](https://img.shields.io/badge/docs-online-6366f1?style=for-the-badge)](https://data-wise.github.io/examify/)

**Create exams in Markdown → Import to Canvas in minutes**

[📖 Documentation](https://data-wise.github.io/examify/) • [🚀 Getting Started](https://data-wise.github.io/examify/getting-started/) • [🐛 Report Issue](https://github.com/Data-Wise/examify/issues)

</div>

---

## What is Examify?

Examify converts your Markdown exam files into QTI packages that Canvas can import directly. No more clicking through Canvas forms question-by-question.

**Perfect for:** Instructors, teaching assistants, and course developers who want to author exams in plain text.

---

## Installation

**Try without installing:**

```bash
npx examify myexam.md -o myexam.qti.zip
```

**Install permanently:**

| Platform | Command |
|----------|---------|
| **Mac** | `brew tap data-wise/tap && brew install examify` |
| **Any (npm)** | `npm install -g examify` |

<details>
<summary>Developer setup</summary>

```bash
git clone https://github.com/Data-Wise/examify.git
cd examify && npm install && npm run build && npm link
```

</details>

---

## Quick Example

**Step 1:** Write your exam in Markdown

```markdown
# Midterm Exam

## 1. The capital of France is [2 pts]

a) London
b) **Paris** ✓
c) Berlin

## 2. [TF] Water boils at 100°C at sea level. → True

## 3. [Essay, 10pts] Explain photosynthesis.
```

**Step 2:** Convert to QTI

```bash
examify midterm.md -o midterm.qti.zip
```

**Step 3:** Import to Canvas

Go to **Course Settings → Import Content → QTI .zip** and upload your file.

---

## Features

| Feature | Description |
|---------|-------------|
| **6 Question Types** | Multiple choice, true/false, multi-answer, short answer, essay, numeric |
| **LaTeX Math** | Write `$x^2$` or `$$\sum_{i=1}^n x_i$$` — converted automatically |
| **Image Bundling** | Local images are packaged into the QTI zip automatically |
| **Canvas Emulator** | Test your package *before* uploading with `examify emulate-canvas` |
| **Quarto Support** | Use R/Python to generate dynamic, randomized questions |

---

## Commands

```bash
examify <file.md> -o <output.qti.zip>   # Convert markdown to QTI
examify emulate-canvas <file.qti.zip>   # Simulate Canvas import
examify verify <file.qti.zip>           # Validate package structure
examify check <file.md>                 # Lint markdown for errors
examify <file.md> --preview             # Preview parsed questions
```

---

## Templates

Get started quickly with a template:

| Template | Description |
|----------|-------------|
| [starter-exam-md.md](examples/starter-exam-md.md) | Basic template — one of each question type |
| [canvas-ready.md](examples/canvas-ready.md) | Comprehensive — 21 questions with math & code |

---

## For Quarto Users

If you use R or Python, try our Quarto extension for dynamic questions:

```bash
quarto add Data-Wise/examify
```

```yaml
format:
  exam-gfm: default   # For Canvas import
  exam-pdf: default   # For paper exams
```

📖 [Quarto Extension Guide →](https://data-wise.github.io/examify/extensions/quarto/)

---

## Documentation

| Topic | Link |
|-------|------|
| Getting Started | [Install and first exam](https://data-wise.github.io/examify/getting-started/) |
| Input Formats | [Question syntax guide](https://data-wise.github.io/examify/formats/) |
| Tutorials | [R/Quarto, VS Code tips](https://data-wise.github.io/examify/tutorials/) |
| Troubleshooting | [Common issues](https://data-wise.github.io/examify/troubleshooting/) |

---

<div align="center">

**[Full Documentation →](https://data-wise.github.io/examify/)**

<sub>MIT License • Built by [Data-Wise](https://github.com/Data-Wise)</sub>

</div>
