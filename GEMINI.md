# Examify - Project Notes

## Project Overview

- **Location**: `/Users/dt/dev-tools/examify`
- **Purpose**: Create exams from Markdown and export to Canvas QTI format
- **Documentation**: <https://data-wise.github.io/examify/>
- **Version**: 0.4.0

## Key Commands

```bash
# Convert markdown to QTI (output to scratch folder)
examify input.md -o scratch/output.qti.zip

# Verify QTI package
examify verify package.qti.zip

# Simulate Canvas import
examify emulate-canvas package.qti.zip

# Preview parsed questions
examify input.md --preview

# Lint input file
examify check input.md

# Run tests (32 tests)
npm test
```

## Development Commands

```bash
npm install      # Install dependencies
npm run build    # Build project
npm test         # Run all tests
npm link         # Install globally as 'examify'
```

## Development Rules

- **Generated test files go in `scratch/`** - Keep root directory clean
- **Build before testing**: `npm run build`
- **QTI format**: Uses QTI 1.2 (Canvas Classic Quizzes), not QTI 2.1
- **Images**: Bundled in package with `imsmanifest.xml`

## Input Format Requirements

Questions MUST use `## N. Question` format (with ##):

```markdown
# Pool: Quiz Title

# Section: Multiple Choice

## 1. What is 2 + 2? [2 pts]

1)  Three
2)  **Four** ✓
3)  Five

## 2. [TF] The sky is blue. → True

## 3. [Essay, 10pts] Explain your answer.
```

### Correct Answer Markers

- `**Bold**` or `✓` checkmark
- `[correct]` suffix (Quarto-friendly)
- `*` prefix (e.g., `*a) Answer`)
- `→ True` or `→ False` for T/F questions

### Images

```markdown
## 1. What does this chart show?

![Chart](assets/chart.png)

*a) Linear growth
b)  Exponential growth
```

## Question Types

| Type | Syntax |
|------|--------|
| Multiple Choice | Default |
| True/False | `[TF]` or `→ True/False` |
| Multiple Answer | `[MultiAns]` |
| Essay | `[Essay]` |
| Short Answer | `[Short]` |
| Numeric | `[Numeric]` with `± tolerance` |

## Folder Structure

- `src/` - TypeScript source
- `dist/` - Compiled JavaScript
- `docs/` - MkDocs documentation
- `examples/` - Sample input files
- `scratch/` - **Generated test QTI files (always output here)**
- `tests/` - Vitest test suite

## Canvas Import Process

1. Course → Settings → Import Course Content
2. Content Type: QTI .zip file
3. Upload .qti.zip file
4. Import → Check Quizzes → Manage Question Banks
