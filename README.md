# Examify

<div align="center">

![Examify Hero](https://capsule-render.vercel.app/api?type=waving&color=7C3AED&height=200&section=header&text=Examify&fontSize=90&animation=fadeIn&fontAlignY=35&desc=Beautiful%20Exams,%20Zero%20Friction&descAlignY=55&descSize=20&fontColor=ffffff)

<div style="margin-top: 20px">

[![Version](https://img.shields.io/badge/Examify-v0.4.1-7C3AED?style=for-the-badge&logo=markdown&logoColor=white)](https://github.com/Data-Wise/examify/releases)
[![License](https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-32%20passing-3178C6?style=for-the-badge)](https://github.com/Data-Wise/examify/actions)

</div>

<p align="center" style="font-size: 1.2rem; max-width: 600px; margin: 0 auto; line-height: 1.6;">
  <strong>Transform your Markdown & Quarto documents into Canvas-ready exams.</strong><br>
  No more manual data entry. No more broken images. Just write and publish.
</p>

[📖 Documentation](https://data-wise.github.io/examify/) • [📦 Quarto Extension](https://data-wise.github.io/examify/extensions/quarto/) • [🐛 Report Bug](https://github.com/Data-Wise/examify/issues)

</div>

---

## ⚡ The Ecosystem

Examify isn't just a converter; it's a complete workflow for modern assessment authoring.

| **Examify CLI** | **Quarto Extension** |
|:---:|:---:|
| 💻 **For Developers & Authors** | 🧪 **For Data Scientists** |
| Convert any Markdown file to QTI. | Author in `.qmd` with R/Python code. |
| Automated image bundling. | Seamless render-to-exam workflow. |
| `examify quiz.md` | `quarto render exam.qmd` |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Markdown First

Write questions in specific, clean Markdown. No XML, no GUI clicking. Focus on your content.

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
</table>

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone and link (Recommended for now)
git clone https://github.com/Data-Wise/examify.git
cd examify
npm install && npm run build && npm link
```

### 2. Create Your Exam

Write your questions in `exam.md`:

```markdown
# Section: Multiple Choice

## 1. Which statistical test compares two means? [2 pts]
a) Chi-Square
b) **T-Test** ✓
c) ANOVA

## 2. [Essay, 10pts] Explain P-Values.
```

### 3. Convert & Verify

```bash
# Generate QTI Package
examify exam.md -o exam.qti.zip

# Check compatibility (Optional)
examify emulate-canvas exam.qti.zip
```

### 4. Import to Canvas

Upload `exam.qti.zip` to **Settings > Import Course Content > QTI .zip file**.

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
```

[Read the Quarto Guide →](https://data-wise.github.io/examify/extensions/quarto/)

---

## 💻 Commands

| Command | Usage | Description |
|:---|:---|:---|
| **Convert** | `examify <file> [options]` | Main conversion tool. |
| **Verify** | `examify verify <zip>` | Validates QTI structure and manifests. |
| **Emulate** | `examify emulate-canvas <zip>` | Simulates Canvas import process. |
| **Check** | `examify check <file>` | Lints source file for syntax errors. |

---

<div align="center">

**[Explore Full Documentation ↗](https://data-wise.github.io/examify/)**

<sub>Built with ❤️ by the MediationVerse Team • Licensed under MIT</sub>

</div>
