# CLI Reference

Complete command reference for **Examify**.

## Commands

### Convert (Default)

Convert a Markdown file to QTI package.

```bash
examify <input> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output QTI zip file path |
| `-v, --validate` | Validate output structure |
| `--preview` | Preview parsed questions (no file created) |

**Examples:**

```bash
# Basic conversion
examify quiz.md

# Custom output path
examify quiz.md -o my-quiz.qti.zip

# Preview without generating file
examify quiz.md --preview
```

---

### Verify

Validate an existing QTI package structure.

```bash
examify verify <path>
```

**Examples:**

```bash
examify verify quiz.qti.zip
examify verify ./qti-folder/
```

---

### Emulate Canvas

Simulate Canvas LMS import and predict success/failure.

```bash
examify emulate-canvas <path>
```

**Output includes:**

- Item count and structure analysis
- Canvas-specific validation checks
- Success/failure prediction
- Actionable fix suggestions

---

### Check (Lint)

Lint a Markdown file for syntax errors.

```bash
examify check <input>
# or
examify lint <input>
```

**Examples:**

```bash
examify check quiz.md
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failed, file not found, etc.) |
