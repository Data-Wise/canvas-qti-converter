# Troubleshooting

Common issues and solutions for Examify.

---

## Quick Diagnosis

Run these commands to check your setup:

```bash
# Check Examify is installed
examify --version

# Validate your input file
examify check quiz.md

# Test package structure
examify verify quiz.qti.zip
```

---

## Installation Issues

### Node.js version error

**Symptom:** `Error: Examify requires Node.js 18+`

**Solution:**

```bash
# Check your Node version
node --version

# Install Node 18+ via nvm
nvm install 18
nvm use 18
```

### Command not found after npm link

**Symptom:** `zsh: command not found: examify`

**Solution:**

```bash
# Rebuild and relink
npm run build
npm link

# Or use npx
npx examify quiz.md -o quiz.qti.zip
```

---

## Conversion Issues

### No questions found

**Symptom:** `Warning: No questions found in input file`

**Cause:** Questions must use `## N.` format (double hash with number and period).

**Solution:**

```markdown
# Wrong (single hash)
# 1. What is 2+2?

# Correct (double hash)
## 1. What is 2+2?
```

### Images not bundling

**Symptom:** Images appear broken in Canvas after import

**Cause:** Image paths are relative to the Markdown file location.

**Solution:**

```bash
# Ensure images exist at the referenced path
ls -la assets/

# Use relative paths in your Markdown
![Chart](assets/chart.png)
```

---

## Canvas Import Issues

### "Couldn't determine correct answers"

**Symptom:** Canvas shows warning during import

**Cause:** Answer markers not recognized.

**Solution:** Use one of these markers for correct answers:

| Marker | Example |
|--------|---------|
| `**Bold**` | `2)  **Answer**` |
| `✓` | `2)  Answer ✓` |
| `[correct]` | `2)  Answer [correct]` |

### Import completes but no questions appear

**Symptom:** Canvas says import succeeded but question bank is empty

**Solution:**

1. Navigate to **Quizzes** → **Manage Question Banks**
2. Check for a bank named after your quiz title
3. If still missing, run the Canvas emulator to diagnose:

```bash
examify emulate-canvas quiz.qti.zip
```

---

## Getting Help

- Check [GitHub Issues](https://github.com/Data-Wise/examify/issues)
- See [Contributing Guide](contributing.md) to report bugs
- Review [Input Formats](formats.md) for syntax reference
