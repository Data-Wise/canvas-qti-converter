# Getting Started

Get up and running with Examify in minutes.

---

## Installation

### Quick Start (No Install Needed)

Run directly without installing:

```bash
npx examify quiz.md -o quiz.qti.zip
```

This downloads and runs Examify on-demand. Perfect for trying it out!

---

### Permanent Install

=== "Mac (Homebrew)"

    ```bash
    brew tap data-wise/tap
    brew install examify
    ```
    
    Homebrew handles Node.js dependency automatically.

=== "npm (Mac/Linux/Windows)"

    ```bash
    npm install -g examify
    ```
    
    Requires [Node.js 18+](https://nodejs.org/).

=== "Developer"

    ```bash
    git clone https://github.com/Data-Wise/examify.git
    cd examify
    npm install && npm run build && npm link
    ```

### Verify Installation

```bash
examify --version
```

---

## First Conversion

### 1. Create a quiz file

Create `quiz.md`:

```markdown
# Statistics Quiz

# Section: Multiple Choice

## 1. What is 2 + 2?

a) Three
b) **Four** ✓
c) Five

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

## Templates

Start with a ready-made template:

| Template | Questions | Best For |
|----------|-----------|----------|
| [`starter-exam-md.md`](https://github.com/Data-Wise/examify/blob/main/examples/starter-exam-md.md) | 7 | Beginners |
| [`canvas-ready.md`](https://github.com/Data-Wise/examify/blob/main/examples/canvas-ready.md) | 21 | Full feature coverage |

**Quarto users:** See the [Quarto Extension](extensions/quarto.md) for `.qmd` templates.

---

## Import to Canvas

1. Go to **Settings** → **Import Course Content**
2. Select **QTI .zip file** as Content Type
3. Upload your `.qti.zip` file
4. Click **Import**
5. Navigate to **Quizzes** → **Manage Question Banks**

---

## Next Steps

- [Input Formats](formats.md) — Complete question syntax guide
- [Commands Reference](reference.md) — All CLI options
- [Canvas Emulator](emulator.md) — Pre-import validation
- [Tutorials](tutorials/index.md) — R/Quarto integration
- [Quarto Extension](extensions/quarto.md) — Advanced authoring
