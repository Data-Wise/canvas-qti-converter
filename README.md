# Examark

<div align="center">

![Examark Hero](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,16,18,20&height=200&section=header&text=Examark&fontSize=80&animation=fadeIn&fontAlignY=35&desc=Markdown%20→%20Canvas%20Quizzes&descAlignY=55&descSize=22&fontColor=ffffff)

[![npm version](https://img.shields.io/npm/v/examark?style=flat-square&logo=npm&color=CB3837)](https://www.npmjs.com/package/examark)
[![CI](https://img.shields.io/github/actions/workflow/status/Data-Wise/examark/ci.yml?branch=main&style=flat-square&logo=github&label=CI)](https://github.com/Data-Wise/examark/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/github/actions/workflow/status/Data-Wise/examark/publish_docs.yml?branch=main&style=flat-square&logo=readthedocs&logoColor=white&label=Docs)](https://data-wise.github.io/examark/)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

**Write exams in Markdown. Export to Canvas in seconds.**

[Documentation](https://data-wise.github.io/examark/) · [Getting Started](https://data-wise.github.io/examark/getting-started/) · [Report Bug](https://github.com/Data-Wise/examark/issues)

</div>

---

## Why Examark?

Stop clicking through Canvas forms. **Write once, export anywhere.**

```
┌─────────────────┐      ┌──────────┐      ┌─────────────────┐
│   quiz.md       │ ───▶ │ examark  │ ───▶ │  quiz.qti.zip   │
│   (Markdown)    │      │          │      │  (Canvas-ready) │
└─────────────────┘      └──────────┘      └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   quiz.txt      │
                    │   (Printable)   │
                    └─────────────────┘
```

**Perfect for:** Instructors, TAs, and course developers who want version-controlled, portable exam files.

---

## Quick Start

**No installation needed** — try it now:

```bash
npx examark quiz.md -o quiz.qti.zip
```

### Write Your Exam

```markdown
# Statistics Midterm

1. [MC] What is the mean of 2, 4, 6? [2pts]
a) Three
b) Four [x]
c) Five

2. [TF] Variance can be negative. [1pt]
a) True
b) False [x]

3. [Essay, 10pts] Explain the Central Limit Theorem.
```

### Convert & Import

```bash
examark midterm.md -o midterm.qti.zip    # For Canvas
examark midterm.md -f text                # For printing
```

Then: **Canvas → Settings → Import Content → QTI .zip**

---

## Features

<table>
<tr>
<td width="50%">

### 📝 Clean Syntax
Write questions naturally without complex markup.
```markdown
1. [MC] Question here [2pts]
a) Wrong
b) Right [x]
```

</td>
<td width="50%">

### 🧮 LaTeX Math
Full equation support, auto-converted for Canvas.
```markdown
Find $\bar{x}$ given:
$$\bar{x} = \frac{\sum x_i}{n}$$
```

</td>
</tr>
<tr>
<td>

### 📦 8 Question Types
- Multiple Choice (`[MC]`)
- True/False (`[TF]`)
- Multiple Answer (`[MA]`)
- Short Answer (`[Short]`)
- Numeric (`[Numeric]`)
- Essay (`[Essay]`)
- Matching (`[Match]`)
- Fill-in-Blanks (`[FMB]`)

</td>
<td>

### 🔧 Powerful CLI
```bash
examark *.md -o output/       # Batch convert
examark quiz.md -f text       # Paper exams
examark verify pkg --strict   # New Quizzes check
examark check quiz.md         # Lint syntax
```

</td>
</tr>
<tr>
<td>

### 🖼️ Image Bundling
Local images automatically packaged into QTI.
```markdown
![Graph](assets/chart.png)
```

</td>
<td>

### 🔬 Quarto Integration
Dynamic questions with R/Python.
```yaml
format:
  exam-qti: default
  exam-pdf: default
```

</td>
</tr>
</table>

---

## Installation

### Option 1: No Installation (Recommended for beginners)

Run directly without installing anything (requires [Node.js](https://nodejs.org/)):

```bash
npx examark quiz.md -o quiz.qti.zip
```

This downloads and runs examark automatically. Perfect for trying it out!

---

### Option 2: Install Globally

For frequent use, install once and run anytime:

**Mac (Homebrew):**
```bash
brew tap data-wise/tap
brew install examark
```

**Windows / Mac / Linux (npm):**
```bash
npm install -g examark
```

After installing, just run:
```bash
examark quiz.md -o quiz.qti.zip
```

---

### First Time on Windows?

If you've never used Node.js before:

1. **Download Node.js** from [nodejs.org](https://nodejs.org/) — click the big green "LTS" button
2. **Run the installer** — accept all defaults, click Next through everything
3. **Open Command Prompt** or PowerShell (search "cmd" in Start menu)
4. **Verify it worked:** `node --version` (should show a version number)
5. **Run examark:** `npx examark quiz.md -o quiz.qti.zip`

That's it! No complicated setup needed.

<details>
<summary><b>Advanced: Install from source</b></summary>

```bash
git clone https://github.com/Data-Wise/examark.git
cd examark && npm install && npm run build && npm link
```
</details>

---

## Commands

| Command | Description |
|---------|-------------|
| `examark <file.md>` | Convert to QTI (default: `file.qti.zip`) |
| `examark <file.md> -f text` | Export as printable plain text |
| `examark *.md -o output/` | Batch convert multiple files |
| `examark verify <pkg>` | Validate QTI package |
| `examark verify <pkg> --strict` | Strict validation for New Quizzes |
| `examark emulate-canvas <pkg>` | Simulate Canvas import |
| `examark check <file.md>` | Lint markdown for errors |
| `examark --preview` | Preview parsed questions (JSON) |

**Options:** `-o <output>` · `-p <points>` · `-t <title>` · `--no-answers` · `-v` · `--strict`

---

## Configuration

Create `.examarkrc.json` for project defaults:

```json
{
  "defaultPoints": 2,
  "outputDir": "output",
  "validate": true
}
```

---

## Templates

| Template | Description |
|----------|-------------|
| [starter-exam-md.md](examples/starter-exam-md.md) | Basic — one of each question type |
| [canvas-ready.md](examples/canvas-ready.md) | Comprehensive — 21 questions |

---

## For Quarto Users

Generate dynamic, randomized questions with R or Python:

```bash
quarto add Data-Wise/examark
```

📖 [Quarto Extension Guide →](https://data-wise.github.io/examark/extensions/quarto/)

---

## Documentation

| | |
|---|---|
| 📚 [**Full Docs**](https://data-wise.github.io/examark/) | Complete reference |
| 🚀 [Getting Started](https://data-wise.github.io/examark/getting-started/) | Install + first quiz |
| 📝 [Input Formats](https://data-wise.github.io/examark/formats/) | Question syntax |
| ⚙️ [Configuration](https://data-wise.github.io/examark/config/) | Project settings |
| 🎓 [Tutorials](https://data-wise.github.io/examark/tutorials/) | R/Quarto, VS Code |

---

<div align="center">

**[Get Started →](https://data-wise.github.io/examark/getting-started/)**

Made with ❤️ by [Data-Wise](https://github.com/Data-Wise) · [MIT License](LICENSE)

</div>
