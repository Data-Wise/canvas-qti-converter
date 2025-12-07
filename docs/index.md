# Canvas QTI Converter

[![Version](https://img.shields.io/badge/version-0.2.2-blue)](https://github.com/Data-Wise/canvas-qti-converter)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/Data-Wise/canvas-qti-converter/blob/main/LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

<div class="feature-card" markdown>
**🚀 Convert Markdown questions to Canvas-compatible QTI in seconds**

Turn your simple Markdown files into fully-functional Canvas quiz packages.
</div>

## Features

<div class="grid cards" markdown>

- :material-file-document:{ .lg .middle } **Markdown First**

    ---

    Write questions in simple Markdown. No complex XML required.

- :material-math-integral:{ .lg .middle } **LaTeX Support**

    ---

    Full math equation support with `$...$` and `$$...$$` syntax.

- :material-image:{ .lg .middle } **Image Support**

    ---

    Include images and R/Python-generated figures automatically.

- :material-shield-check:{ .lg .middle } **Canvas Emulator**

    ---

    Predict import success before uploading to Canvas.

</div>

## Quick Install

```bash
git clone https://github.com/Data-Wise/canvas-qti-converter.git
cd canvas-qti-converter
npm install && npm run build && npm link
```

## Example

=== "Input (Markdown)"

    ```markdown
    # Statistics Quiz

    # Section: Multiple Choice

    ## 1. What is the mean of 2, 4, 6?

    1)  Three
    2)  **Four** ✓
    3)  Five
    
    ## 2. [TF] Variance can be negative. → False
    ```

=== "Output (Canvas)"

    ```text
    ✓ Generated QTI 2.1 Package: quiz.qti.zip
      • 2 questions
      • 1 section
    
    ✅ PREDICTION: Canvas import will likely SUCCEED
    ```

## Commands

| Command | Description |
|---------|-------------|
| `qti-convert file.md` | Convert to QTI package |
| `qti-convert verify file.qti.zip` | Validate package structure |
| `qti-convert emulate-canvas file.qti.zip` | Predict Canvas import |
| `qti-convert check file.md` | Lint input file |

## What's New in v0.2.2

!!! tip "Latest Features"
    - **`[correct]` marker** — Quarto-friendly way to mark answers
    - **Canvas Emulator** — Predict import success
    - **Enhanced validation** — Catches common import issues
    - **Image optimization** — Canvas-compatible paths

[Get Started :material-arrow-right:](quickstart.md){ .md-button .md-button--primary }
[View on GitHub :material-github:](https://github.com/Data-Wise/canvas-qti-converter){ .md-button }
