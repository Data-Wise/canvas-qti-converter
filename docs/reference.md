# Commands Reference

Complete command reference for Examify CLI.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `examify <file> -o <out.zip>` | Convert Markdown to QTI |
| `examify verify <pkg>` | Validate package structure |
| `examify emulate-canvas <pkg>` | Simulate Canvas import |
| `examify check <file>` | Lint input file |
| `examify <file> --preview` | Preview parsed questions |

---

## examify (convert)

**Usage:**

```bash
examify <input> [options]
```

**What it does:**

- Parses your Markdown file for questions
- Generates QTI 1.2 XML for Canvas Classic Quizzes
- Bundles images with `imsmanifest.xml`
- Creates a `.qti.zip` package

**When to use:**

Converting your Markdown quiz files for Canvas import.

**Options:**

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output path (default: `<input>.qti.zip`) |
| `-v, --validate` | Validate output after generating |
| `--preview` | Preview parsed questions, no file created |

**Example:**

```bash
# Basic conversion
examify quiz.md

# Custom output path
examify quiz.md -o output/my-quiz.qti.zip

# Preview without generating
examify quiz.md --preview
```

---

## verify

**Usage:**

```bash
examify verify <path>
```

**What it does:**

- Validates manifest structure
- Checks all referenced resources exist
- Validates XML syntax
- Reports missing or malformed files

**When to use:**

Checking an existing QTI package before Canvas import.

**Example:**

```bash
examify verify quiz.qti.zip
examify verify ./qti-folder/
```

---

## emulate-canvas

**Usage:**

```bash
examify emulate-canvas <path>
```

**What it does:**

- Simulates Canvas LMS import process
- Validates QTI 1.2 compatibility
- Checks for duplicate IDs
- Predicts import success or failure

**When to use:**

Before uploading to Canvas, especially for complex quizzes.

**Example:**

```bash
examify emulate-canvas quiz.qti.zip
```

**Output includes:**

- Item count and structure analysis
- Canvas-specific validation checks
- Success/failure prediction
- Actionable fix suggestions

---

## check (lint)

**Usage:**

```bash
examify check <input>
# or
examify lint <input>
```

**What it does:**

- Validates Markdown syntax
- Checks question formatting
- Reports missing answer markers
- Identifies structural issues

**When to use:**

Before conversion to catch input errors early.

**Example:**

```bash
examify check quiz.md
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failed, file not found, etc.) |
