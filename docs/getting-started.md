# Getting Started

Get up and running with Examify in 5 minutes.

---

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** — Included with Node.js

---

## Installation

=== "Git Clone (Recommended)"

    ```bash
    git clone https://github.com/Data-Wise/examify.git
    cd examify
    npm install
    npm run build
    npm link
    ```

=== "Manual Download"

    1. Download from [GitHub Releases](https://github.com/Data-Wise/examify/releases)
    2. Extract and navigate to the folder
    3. Run `npm install && npm run build && npm link`

---

## First Conversion

### 1. Create a quiz file

Create `quiz.md`:

```markdown
# Statistics Quiz

# Section: Multiple Choice

## 1. What is 2 + 2?

1)  Three
2)  **Four** ✓
3)  Five

## 2. [TF] The sky is blue. → True

## 3. [Essay, 10pts] Explain the water cycle.
```

### 2. Convert to QTI

```bash
examify quiz.md -o quiz.qti.zip
```

Output:

```text
✓ Generated QTI 1.2 Package: quiz.qti.zip
  • 3 questions
  • 1 section
  • 0 images bundled
```

### 3. Verify the package

```bash
examify emulate-canvas quiz.qti.zip
```

Output:

```text
🎓 Canvas Import Emulator

📊 Analysis Results:
   Items scanned: 3
   Resources: 4
   Has test structure: Yes

✅ PREDICTION: Canvas import will likely SUCCEED
```

---

## Verification

Confirm Examify is working:

```bash
examify --version
examify --help
```

---

## Import to Canvas

1. Go to **Settings** → **Import Course Content**
2. Select **QTI .zip file** as Content Type
3. Upload your `.qti.zip` file
4. Click **Import**
5. Navigate to **Quizzes** → **Manage Question Banks**

---

## Next Steps

- [Commands Reference](reference.md) — All CLI options
- [Input Formats](formats.md) — Question syntax guide
- [Canvas Emulator](emulator.md) — Pre-import validation
- [Tutorials](tutorials/index.md) — R/Quarto integration
