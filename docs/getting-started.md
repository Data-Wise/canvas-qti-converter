# Getting Started

Get up and running with Examark in minutes.

---

## Installation

### Quick Start (No Install Needed)

Run Examark directly using npx (requires Node.js):

```bash
npx examark quiz.md -o quiz.qti.zip
```

This downloads and runs Examark on-demand. Perfect for trying it out!

---

### Permanent Install

=== "Mac (Homebrew)"

    **Recommended for Mac users:**

    ```bash
    brew tap data-wise/tap
    brew install examark
    ```
    
    Homebrew handles the Node.js dependency automatically.

=== "Mac/Linux (npm)"

    ```bash
    npm install -g examark
    ```
    
    Requires [Node.js 18+](https://nodejs.org/).

=== "Windows"

    **Never used Node.js before?** No problem! Here's the complete guide:

    1. **Download Node.js** from [nodejs.org](https://nodejs.org/) — click the big green "LTS" button
    2. **Run the installer** — accept all defaults, click Next through everything
    3. **Open Command Prompt** — search "cmd" in Start menu
    4. **Verify Node installed:** type `node --version` and press Enter
    5. **Install examark:**

    ```powershell
    npm install -g examark
    ```

    6. **Verify it worked:**

    ```powershell
    examark --version
    ```

    !!! tip "Quickest Option"
        Skip the global install and just use `npx examark quiz.md` — it runs without installing!

=== "Developer"

    For contributing or modifying the source:

    ```bash
    git clone https://github.com/Data-Wise/examark.git
    cd examark
    npm install
    npm run build
    npm link
    ```

### Verify Installation

```bash
examark --version
```

---

## First Conversion

### 1. Create a quiz file

Create `quiz.md`:

=== "Clean Syntax (Recommended)"

    ```markdown
    # Statistics Quiz

    # Section: Multiple Choice

    1. [MC] What is 2 + 2? [2pts]
    a) Three
    b) Four [x] // Correct answer
    c) Five

    2. [TF] The sky is blue. [1pt]
    a) True [x]
    b) False

    3. [Essay, 10pts] Explain the water cycle.
    ```

=== "Traditional Syntax"

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
examark quiz.md -o quiz.qti.zip
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
examark emulate-canvas quiz.qti.zip
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
| [`starter-exam-md.md`](https://github.com/Data-Wise/examark/blob/main/examples/starter-exam-md.md) | 7 | Beginners |
| [`canvas-ready.md`](https://github.com/Data-Wise/examark/blob/main/examples/canvas-ready.md) | 21 | Full feature coverage |

**Quarto users:** See the [Quarto Extension](extensions/quarto.md) for `.qmd` templates.

---

## Import to Canvas

1. Go to **Settings** → **Import Course Content**
2. Select **QTI .zip file** as Content Type
3. Upload your `.qti.zip` file
4. Click **Import**
5. Navigate to **Quizzes** → **Manage Question Banks**

---

## Other Export Options

### Plain Text (Paper Exams)

Export for printing:

```bash
examark quiz.md -f text -o quiz.txt
```

### Batch Conversion

Convert multiple files at once:

```bash
examark *.md -o output/
```

### Project Configuration

Create `.examarkrc.json` for project settings:

```json
{
  "defaultPoints": 2,
  "outputDir": "output",
  "validate": true
}
```

See [Configuration](config.md) for all options.

---

## Next Steps

- [Input Formats](formats.md) — Complete question syntax guide
- [Commands Reference](reference.md) — All CLI options
- [Configuration](config.md) — Project settings
- [Canvas Emulator](emulator.md) — Pre-import validation
- [Tutorials](tutorials/index.md) — R/Quarto integration
- [Quarto Extension](extensions/quarto.md) — Advanced authoring
