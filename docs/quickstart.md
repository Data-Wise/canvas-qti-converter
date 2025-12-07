# Quick Start

Get started with Canvas QTI Converter in 5 minutes.

## Installation

```bash
# Clone the repository
git clone https://github.com/Data-Wise/canvas-qti-converter.git
cd canvas-qti-converter

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

## Your First Conversion

### 1. Create a Markdown File

Create `quiz.md` with this format:

!!! warning "Required Format"
    Questions **must** start with `## N.` (number with period after double hash).

```markdown
# Statistics Quiz

# Section: Multiple Choice

## 1. What is 2 + 2?

1)  Three
2)  **Four** ✓
3)  Five

## 2. [TF] The sky is blue. → True

## 3. [Essay, 10pts] Explain the water cycle.

Describe the main stages of evaporation, condensation, and precipitation.
```

### 2. Convert to QTI

```bash
qti-convert quiz.md -o quiz.qti.zip
```

Expected output:

```text
✓ Generated QTI 2.1 Package: quiz.qti.zip
  • 3 questions
  • 1 section
  • Folder structure: items/, tests/, imsmanifest.xml
```

### 3. Verify Your Package

```bash
qti-convert emulate-canvas quiz.qti.zip
```

Expected output:

```text
🎓 Canvas Import Emulator

📊 Analysis Results:
   Items scanned: 3
   Resources: 4
   Has test structure: Yes

✅ PREDICTION: Canvas import will likely SUCCEED
```

### 4. Import to Canvas

1. Go to your Canvas course
2. Click **Settings** → **Import Course Content**
3. Select **QTI .zip file** as Content Type
4. Upload your `quiz.qti.zip`
5. Click **Import**
6. Navigate to **Quizzes** → **Manage Question Banks**

!!! success "Done!"
    Your questions are now in Canvas as a question bank.

---

## Quick Reference

### Correct Answer Markers

| Marker | Example | Notes |
|--------|---------|-------|
| `**Bold**` | `2)  **Answer**` | Visual |
| `✓` | `2)  Answer ✓` | Unicode checkmark |
| `[correct]` | `2)  Answer [correct]` | Quarto-safe |
| `*` prefix | `*2)  Answer` | Traditional |

### Question Type Tags

| Tag | Description |
|-----|-------------|
| `[TF]` | True/False |
| `[Essay]` | Essay question |
| `[MultiAns]` | Multiple correct answers |
| `[Short]` | Short answer |
| `[Numeric]` | Numeric with tolerance |

---

## What's Next?

- [Input Formats](formats.md) — All question types and syntax
- [Canvas Emulator](emulator.md) — Predict import success
- [CLI Reference](reference.md) — All command options
