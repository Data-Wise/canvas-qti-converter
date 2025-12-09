# Commands Reference

Complete command reference for Examark CLI.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `examark <file> -o <out.zip>` | Convert Markdown to QTI |
| `examark <file> -f text` | Export as printable text |
| `examark *.md -o output/` | Batch convert multiple files |
| `examark verify <pkg>` | Validate package structure |
| `examark verify <pkg> --strict` | Strict validation for New Quizzes |
| `examark emulate-canvas <pkg>` | Simulate Canvas import |
| `examark check <file>` | Lint input file |
| `examark <file> --preview` | Preview parsed questions |

---

## examark (convert)

**Usage:**

```bash
examark <input> [options]
examark <pattern> -o <directory>   # Batch mode
```

**What it does:**

- Parses your Markdown file for questions
- Generates QTI 1.2 XML for Canvas Classic Quizzes
- Bundles images with `imsmanifest.xml`
- Creates a `.qti.zip` package (or `.txt` for text export)

**When to use:**

Converting your Markdown quiz files for Canvas import or printable exams.

**Options:**

| Option | Description |
|--------|-------------|
| `-o, --output <path>` | Output file or directory (batch mode) |
| `-f, --format <type>` | Output format: `qti` (default) or `text` |
| `-v, --validate` | Validate output after generating |
| `-p, --points <n>` | Default points per question |
| `-t, --title <title>` | Override quiz title |
| `--preview` | Preview parsed questions, no file created |
| `--no-answers` | Exclude answer key from text export |

**Examples:**

```bash
# Basic conversion to QTI
examark quiz.md

# Custom output path
examark quiz.md -o output/my-quiz.qti.zip

# Export as printable text
examark quiz.md -f text

# Text export without answers
examark quiz.md -f text --no-answers

# Batch convert all markdown files
examark *.md -o output/

# Set default points
examark quiz.md -p 2

# Preview without generating
examark quiz.md --preview
```

---

## Batch Conversion

Convert multiple files at once using glob patterns:

```bash
# Convert all .md files in current directory
examark *.md -o output/

# Convert files from specific folder
examark exams/*.md -o qti-packages/

# Convert specific pattern
examark midterm-*.md -o midterms/
```

**Notes:**

- Output directory is created if it doesn't exist
- Each file is named based on input: `quiz.md` → `quiz.qti.zip`
- Errors in one file don't stop processing of others
- Summary shows success/failure counts

---

## Text Export

Export quizzes as plain text for paper exams:

```bash
examark quiz.md -f text
examark quiz.md -f text -o exam.txt
examark quiz.md -f text --no-answers
```

**Output includes:**

- Quiz title and header
- Name/Date fields for students
- All questions formatted for printing
- Answer key at the end (unless `--no-answers`)

**Example output:**

```text
STATISTICS QUIZ 1
Name: _________________________  Date: _________

1. [2 pts] What is the mean of 2, 4, 6?
   a) Three
   b) Four
   c) Five

2. [1 pt] TRUE or FALSE: Variance can be negative.

---
ANSWER KEY
1. b
2. False
```

---

## verify

**Usage:**

```bash
examark verify <path> [options]
```

**What it does:**

- Validates manifest structure
- Checks all referenced resources exist
- Validates XML syntax
- Reports missing or malformed files

**Options:**

| Option | Description |
|--------|-------------|
| `--strict` | Enable strict validation for New Quizzes compatibility |

**When to use:**

Checking an existing QTI package before Canvas import. Use `--strict` for Canvas New Quizzes.

**Examples:**

```bash
# Standard validation
examark verify quiz.qti.zip
examark verify ./qti-folder/

# Strict validation for New Quizzes
examark verify quiz.qti.zip --strict
```

**Strict Mode Checks:**

When `--strict` is enabled, additional validations are performed:

- Assessment must have `ident` attribute
- Each item must have `itemmetadata` with `qtimetadata`
- Each item must have `question_type` metadata
- Each item must have `points_possible` metadata
- Each item must have `resprocessing` element (for auto-graded questions)
- Item identifiers must be alphanumeric with underscores only

---

## emulate-canvas

**Usage:**

```bash
examark emulate-canvas <path> [options]
```

**What it does:**

- Simulates Canvas LMS import process
- Validates QTI 1.2 compatibility
- Checks for duplicate IDs
- Predicts import success or failure

**Options:**

| Option | Description |
|--------|-------------|
| `--strict` | Enable strict validation for New Quizzes compatibility |

**When to use:**

Before uploading to Canvas, especially for complex quizzes. Use `--strict` if targeting Canvas New Quizzes.

**Examples:**

```bash
# Emulate Classic Quizzes import
examark emulate-canvas quiz.qti.zip

# Emulate New Quizzes import (stricter)
examark emulate-canvas quiz.qti.zip --strict
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
examark check <input>
# or
examark lint <input>
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
examark check quiz.md
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failed, file not found, etc.) |
