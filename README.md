# Canvas QTI Converter

<div align="center">

![Version](https://img.shields.io/npm/v/canvas-qti-converter?color=blue&style=flat-square)
![License](https://img.shields.io/github/license/Data-Wise/canvas-qti-converter?style=flat-square)
![Tests](https://img.shields.io/github/actions/workflow/status/Data-Wise/canvas-qti-converter/publish_docs.yml?label=tests&style=flat-square)

**Convert Markdown questions to Canvas-compatible QTI 2.1 packages.**

[Documentation](https://data-wise.github.io/canvas-qti-converter/) • [Report Bug](https://github.com/Data-Wise/canvas-qti-converter/issues) • [Request Feature](https://github.com/Data-Wise/canvas-qti-converter/issues)

</div>

---

## ✨ Features

- **📝 Markdown First**: Write questions in plain text or Markdown.
- **✅ Correct Answers**: Mark answers with `*` or `✓`.
- **🧮 LaTeX Support**: Full support for math equations (`\( x^2 \)`) converted to Canvas format.
- **🖼️ Image Support**: Automatically bundles referenced local images.
- **🛡️ Built-in Validator**: `verify` command ensures your package imports cleanly.
- **🆕 v0.2.2**: `[correct]` marker for Quarto, `[MultiAns]`/`[TF]` type tags.

## 🚀 Quick Start

```bash
# 1. Install
npm install -g canvas-qti-converter

# 2. Convert a file
qti-convert exam.md -o exam-export.qti.zip

# 3. Import to Canvas
# Go into a Course > Settings > Import Course Content > QTI .zip file
```

## 📄 Input Format Example

```markdown
# Section: Multiple Choice

1. What is the powerhouse of the cell?
   a) Nucleus
   b) Mitochondria ✓
   c) Ribosome

2. [TF] The sun rises in the west. -> False

<div class="solution">
  This text is ignored and won't appear in the quiz.
</div>
```

Full format documentation is available at our [Documentation Site](https://data-wise.github.io/canvas-qti-converter/formats/).

## 🛠️ Development

```bash
git clone https://github.com/Data-Wise/canvas-qti-converter.git
cd canvas-qti-converter
npm install
npm run build
npm test
```

## 📄 License

MIT © [MediationVerse Team](https://github.com/Data-Wise)
