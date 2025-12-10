# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Examark converts Markdown exam files to QTI 1.2 packages for Canvas LMS import.

- **Repo**: Data-Wise/examark
- **Docs**: https://data-wise.github.io/examark/
- **Version**: 0.6.6 | **Tests**: 233 passing
- **Distribution**: npm (`examark`), Homebrew (`data-wise/tap/examark`), Quarto extension

## Recent Changes (Dec 2025)

**v0.6.6 - Templates Reorganization:**
- Reorganized examples and templates into categorized folders:
  - `templates/markdown/` - Production-ready Markdown starters (minimal.md, starter.md, all-question-types.md)
  - `templates/quarto/` - Quarto starters (minimal.qmd, starter.qmd, dynamic.qmd, with-figures.qmd)
  - `examples/markdown/` - Demo/testing files (statistics-exam.md, with-images.md, validation-test.md, edge-cases.md)
  - `examples/quarto/` - Quarto examples (statistics-exam.qmd, canvas-export.qmd, python-figures.qmd)
- Updated all documentation to reference new paths
- 39 Quarto extension tests (38 passing, 1 skipped)
- Extension copies in subdirs are gitignored (created at test time)

## History

**v0.6.0** (Dec 2025): Renamed from `examify` to `examark` to avoid company name conflict.

**Backward Compatibility:**
- Config files: Both `.examarkrc.json` and legacy `.examifyrc.json` supported
- npm: `examify` deprecated with redirect message
- Homebrew: `examify` formula deprecated
- GitHub: Old URLs auto-redirect

## Project Status

### Completed Features ✅

**Core Functionality:**
- Markdown to QTI 1.2 conversion for Canvas LMS
- 10 question types: MC, MA, TF, Essay, Short Answer, Numerical, Matching, FMB, Fill-in-Blank
- 80+ type marker aliases (case-insensitive)
- Multiple answer markers: `[x]`, `**bold**`, `✓`, `[correct]`, `*` prefix
- Two syntax styles: Traditional (`## 1.`) and Clean (`1. [MC]`)
- LaTeX math preservation (`$...$` → `\(...\)`)
- Image bundling with automatic resolution
- Inline and blockquote feedback support
- General feedback (`> [feedback]`)

**Output Formats:**
- QTI 1.2 ZIP packages for Canvas import
- Plain text export for printing (`-f text`)
- Answer key inclusion/exclusion (`--no-answers`)

**Validation & Diagnostics:**
- Pre-conversion linting (`examark check`)
- Post-conversion validation (`examark verify`)
- Canvas import emulation (`examark emulate-canvas`)
- Strict validation mode for New Quizzes (`--strict`)

**CLI & Configuration:**
- Batch conversion (`examark *.md`)
- Config file support (`.examarkrc.json`)
- Preview mode (`--preview`)
- Title and points overrides

**Quarto Extension (v0.6.6):**
- 6 output formats: HTML, PDF, GFM, ODT, DOCX, Typst
- Dynamic content with R/Python code chunks
- Solution visibility toggle
- QTI export workflow integration
- 39 tests (38 passing, 1 skipped)

**Distribution:**
- npm package (`examark`)
- Homebrew formula (`data-wise/tap/examark`)
- Quarto extension (`quarto add Data-Wise/examark`)
- Automated releases via GitHub Actions + OIDC

**Project Hygiene (v0.6.6):**
- Reorganized templates and examples into categorized folders
- 233 tests passing
- Full backward compatibility for renamed project

### Canvas New Quizzes Support ✅

**Background:** Canvas New Quizzes accepts QTI 1.2 but is stricter about compliance than Classic Quizzes. No official sunset date for Classic Quizzes exists.

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Strict validation mode (`--strict`) | ✅ Complete |
| 2 | Audit/Fix non-compliant QTI output | ✅ Complete (already compliant) |
| 3 | QTI 2.1 export (future, if needed) | Not Started |

### In Progress 🚧

*No active development items currently.*

### Future Enhancements 📋

**Near-term (Good First Issues):**
- Question pools/banks support
- Answer randomization options
- Numeric answer ranges and tolerances
- Auto-run examark after Quarto render (post-render hook)

**Medium-term:**
- QTI 2.1 export format (`src/generator/qti21.ts` exists, needs integration)
- Question weighting/partial credit
- More detailed error messages with line numbers
- Import from other quiz formats (Moodle XML, GIFT)

**Long-term:**
- Web UI for preview and editing
- Question bank management
- AI-assisted question generation
- LTI integration for direct Canvas publishing

### Research Notes (Dec 2025)

- UNM Canvas: Both Classic and New Quizzes enabled, no migration deadline
- Canvas QTI 2.1: Supported in both quiz types
- New Quizzes: Stricter validation, same QTI format

## Build & Test Commands

```bash
# Build (required before testing)
npm run build

# Run all tests
npm test

# Run single test file
npm test -- tests/parser.test.ts

# Run specific test by name
npm test -- -t "should parse a standard quiz"

# Watch mode during development
npm run dev

# Local CLI testing after build
node dist/index.js input.md -o output.qti.zip
```

## CLI Commands

```bash
# Single file conversion
examark input.md -o output.qti.zip    # Convert to QTI (default)
examark input.md -f text              # Export as plain text for printing
examark input.md -f text --no-answers # Exclude answer key from text
examark input.md -p 2                 # Set default points to 2
examark input.md -t "Final Exam"      # Override quiz title
examark input.md -v                   # Convert and validate output
examark input.md --preview            # Preview parsed questions (JSON)

# Batch conversion
examark *.md -o output/               # Convert all .md files to output/
examark exams/*.md -f text            # Export multiple files as text

# Validation and utilities
examark verify package.qti.zip         # Validate package structure
examark verify package.qti.zip --strict # Strict validation for New Quizzes
examark emulate-canvas package.qti.zip # Simulate Canvas import
examark check input.md                 # Lint markdown for errors
```

## Configuration File

Create `.examarkrc.json` or `examark.config.json` in your project:

```json
{
  "defaultPoints": 2,
  "outputDir": "./qti-output",
  "validate": true,
  "title": "My Quiz"
}
```

| Option | Type | Description |
|--------|------|-------------|
| `defaultPoints` | number | Default points for questions without `[N pts]` |
| `outputDir` | string | Directory for output files |
| `validate` | boolean | Auto-validate after conversion |
| `title` | string | Override quiz title |

Config is searched from input file directory up to root. CLI flags override config values.

## Input Format

Two syntax styles supported:

### Traditional Syntax (with ## headers)
```markdown
## 1. What is 2 + 2? [2 pts]
a) Three
b) Four [x]
```

### Clean Syntax (no headers - better for Quarto HTML/PDF)
```markdown
1. [MC] What is 2 + 2? [2pts]
a) Three
b) Four [x]
```

### Full Example
```markdown
# Quiz Title
# Section: Multiple Choice

1. [MC] What is 2 + 2? [2pts]
a) Three // This is too small
b) Four [x] // Correct answer with inline feedback
c) Five

2. [TF] The sky is blue. [1pt]
a) True [x]
b) False

3. [Essay, 10pts] Explain your answer.

4. [Match] Match the statistic to its formula [4pts]
- Mean => Σx/n
- Variance => Σ(x-μ)²/n
- Standard Deviation => √Variance

5. [FMB] Complete the sentence [2pts]
The correlation r ranges from [blank1] to [blank2].

[blank1]: -1
[blank2]: 1, +1

6. Question with blockquote feedback
1) Wrong answer
> Incorrect. This is feedback for wrong answer.
2) **Right answer**
> Correct! This explains why.

> [feedback] General feedback shown after submission.
```

### Correct Answer Markers (all case-insensitive)

| Marker | Example |
|--------|---------|
| `[x]` | `b) Answer [x]` |
| `**Bold**` | `b) **Answer**` |
| `✓` or `✔` | `b) Answer ✓` |
| `[correct]` | `b) Answer [correct]` |
| `*` prefix | `*b) Answer` |

### Type Markers (all case-insensitive)

| Short | Aliases | Description |
|-------|---------|-------------|
| `[TF]` | `[TrueFalse]`, `[True/False]`, `[T/F]` | True/False |
| `[MC]` | `[MultiChoice]`, `[Multiple Choice]` | Multiple Choice (default) |
| `[MA]` | `[MultiAns]`, `[MultiAnswer]`, `[SelectAll]` | Multiple Answers |
| `[Essay]` | `[LongAnswer]` | Essay |
| `[Short]` | `[SA]`, `[ShortAnswer]`, `[FillBlank]`, `[FIB]` | Short Answer |
| `[Num]` | `[Numeric]`, `[Numerical]`, `[Number]` | Numerical |
| `[Match]` | `[Matching]`, `[MAT]` | Matching |
| `[FMB]` | `[FillBlanks]`, `[MultiBlanks]`, `[FITB]` | Fill Multiple Blanks |

### Feedback Formats

| Format | Example |
|--------|---------|
| Inline `//` | `a) Answer [x] // This is why it's correct` |
| Blockquote `>` | Line after option: `> Feedback text` |
| General | `> [feedback] Shown after submission` |

### Matching Separators

Both `=>` and `::` work: `- Mean => Σx/n` or `- Mean :: Σx/n`

## Data Flow

```
Input.md
    │
    ▼
parseMarkdown() ──────────────► ParsedQuiz
    │                              │
    │  extractTypeMarker()         │ { title, sections, questions[] }
    │  parseOptions()              │
    │  extractPoints()             │
    │                              ▼
    │                         generateQTI()
    │                              │
    │                              │  generateQuestionXml()
    │                              │  escapeXmlPreserveLaTeX()
    │                              │  generateResprocessing()
    │                              ▼
    │                         QTI 1.2 XML + imsmanifest.xml
    │                              │
    ▼                              ▼
lintMarkdown() ◄──────────   QtiValidator.validatePackage()
(pre-conversion)              (post-conversion)
```

## Architecture

```
src/
├── index.ts              # CLI entry (Commander.js) - all commands defined here
├── config.ts             # loadConfig() - loads .examarkrc.json settings
├── parser/
│   ├── markdown.ts       # parseMarkdown() - converts MD to ParsedQuiz
│   └── types.ts          # Question, AnswerOption, ParsedQuiz types
├── generator/
│   ├── qti.ts            # generateQTI() - produces QTI 1.2 XML for Canvas
│   └── text.ts           # generateText() - produces plain text for printing
└── diagnostic/
    ├── validator.ts      # QtiValidator class - validates QTI packages
    └── linter.ts         # lintMarkdown() - checks MD for errors before conversion
```

**Key types** (`src/parser/types.ts`):
- `QuestionType`: multiple_choice | multiple_answers | true_false | essay | short_answer | numerical | matching | fill_in_multiple_blanks
- `ParsedQuiz`: { title, sections, questions, defaultPoints }
- `Question`: { id, type, stem, options, points, section, images, matchPairs?, blanks?, generalFeedback? }
- `AnswerOption`: { id, text, isCorrect, feedback? }
- `MatchPair`: { left, right }
- `BlankAnswer`: { blankId, answers[] }

## Where to Look

| Task | File(s) |
|------|---------|
| Add CLI flag | `src/index.ts` |
| Change how answers are detected | `src/parser/markdown.ts:parseOptions()` |
| Modify XML output | `src/generator/qti.ts:generateQuestionXml()` |
| Add validation rule | `src/diagnostic/validator.ts` or `linter.ts` |

## Common Workflows

### Adding a new question type
1. Add type to `QuestionType` union in `src/parser/types.ts`
2. Add parsing logic in `src/parser/markdown.ts` (extractTypeMarker, parseQuestionType)
3. Map to Canvas type in `src/generator/qti.ts` (getCanvasQuestionType)
4. Add tests in `tests/parser.test.ts` and `tests/generator.test.ts`

### Debugging a parsing issue
1. Run `examark input.md --preview` to see parsed JSON
2. Check `parseMarkdown()` in `src/parser/markdown.ts`
3. Run specific test: `npm test -- -t "parser"`

## Canvas QTI 1.2 Format

Canvas expects specific XML structure:
- Root: `<questestinterop>` → `<assessment>` → `<section>` → `<item>`
- Question types mapped via `<qtimetadatafield>` with `question_type` label
- Correct answers in `<resprocessing>` with `<varequal>` matching option ident
- LaTeX: `$x$` converted to `\(x\)`, `$$x$$` to `\[x\]`
- Images bundled in package, referenced in `imsmanifest.xml`

**Canvas quirk**: Uses `actoin="Set"` (typo) in `<setvar>` - we match this for compatibility.

## Image Bundling

Images referenced in markdown (`![alt](path.png)`) are:
1. Resolved relative to input file directory
2. Copied to `images/` folder in temp package
3. Added to `imsmanifest.xml` as `<resource type="webcontent">`
4. Referenced in QTI XML as `<img src="images/filename.png"/>`

The `ImageResolver` callback in `generateQTI()` handles path resolution.

## Validation Pipeline

Two validation stages:

**Pre-conversion** (`lintMarkdown`):
- Checks for empty quiz, missing stems, duplicate IDs
- Validates correct answer markers exist
- Warns about multiple correct answers in single-choice

**Post-conversion** (`QtiValidator`):
- Validates XML structure (QTI 1.2 or 2.1)
- Checks all referenced files exist
- Canvas-specific: correct answers, supported interaction types
- Security: detects `<script>`, `<iframe>` in content

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "No questions found" | Missing question format | Use `## 1.` or `1. [Type]` with type marker/points |
| "No correct answer" | Missing answer marker | Add `[x]`, `**bold**`, or `✓` to correct option |
| Build fails | TypeScript errors | Check imports use `.js` extension |

## Development Rules

1. Always run `npm run build` before testing
2. Generated test output goes in `scratch/`
3. Version sync: `npm version patch` auto-updates version in `src/index.ts`

## Release Automation

Releases are fully automated via GitHub Actions (`.github/workflows/release.yml`):

```bash
npm version patch   # Triggers: build → GitHub Release → npm publish → Homebrew update
```

**What happens automatically:**
1. Version bumped in package.json, src/index.ts, extension, README
2. Git tag pushed
3. GitHub Release created with CLI and extension zips
4. Published to npm registry via **OIDC Trusted Publishing** (no tokens!)
5. Homebrew tap formula updated

**Required setup:**
- **npm Trusted Publisher**: Configure on npmjs.com (Settings → Publishing access → Trusted Publishers → GitHub Actions with `Data-Wise/examark` and `release.yml`)
- **`HOMEBREW_TAP_TOKEN`**: GitHub PAT with write access to Data-Wise/homebrew-tap

## Quarto Extension

The project includes a Quarto extension for authoring exams in `.qmd` files with dynamic content (R/Python code chunks).

### Installation

```bash
# Add to existing project
quarto add Data-Wise/examark

# Create new project from template
quarto use template Data-Wise/examark
```

### Available Formats

| Format | Output | Use Case |
|--------|--------|----------|
| `exam-html` | HTML | Browser preview |
| `exam-pdf` | PDF | Printable exams |
| `exam-gfm` | Markdown | QTI conversion via CLI |
| `exam-odt` | ODT | Google Docs, LibreOffice |
| `exam-docx` | DOCX | Microsoft Word |
| `exam-typst` | PDF | Modern PDF (Typst) |

### Document YAML

```yaml
---
title: "My Exam"
format: exam-gfm        # or exam-html, exam-pdf, etc.

exam:
  qti: true             # Enable QTI export instructions
  solutions: false      # Show/hide answer key
  default-points: 2     # Default points per question
---
```

### Project YAML (`_quarto.yml`)

```yaml
project:
  type: default
  output-dir: _output

format:
  exam-html: default    # Default format for all documents

exam:
  solutions: false
  default-points: 2
```

### Extension Structure

```
_extensions/exam/
├── _extension.yml      # Extension config (formats, version)
├── exam-filter.lua     # Pandoc filter for exam processing
├── exam.scss           # HTML theme styles
└── qti-post-render.js  # Post-render script (unused currently)
```

### Key Files

| File | Purpose |
|------|---------|
| `_extensions/exam/_extension.yml` | Defines formats: html, pdf, gfm, odt, docx, typst |
| `_extensions/exam/exam-filter.lua` | Processes exam options, detects `exam.qti` |
| `_quarto.yml` | Project config, default format |
| `template.qmd` | Starter template for `quarto use template` |
| `.quartoignore` | Files excluded from template distribution |

### Format Key Syntax

Extension formats use base format names in `_extension.yml`:
```yaml
contributes:
  formats:
    html:    # Users reference as exam-html
    pdf:     # Users reference as exam-pdf
    gfm:     # Users reference as exam-gfm
```

The full format name = extension directory name + base format (e.g., `exam` + `html` = `exam-html`).

### QTI Export Workflow

1. Add `exam.qti: true` to document YAML
2. Render: `quarto render myexam.qmd`
3. Filter outputs examark command to run
4. Run: `examark myexam.md -o myexam.qti.zip`

### Updating the Extension

After modifying `_extensions/exam/`:
1. Update version in `_extension.yml`
2. Test with `quarto render examples/minimal.qmd`
3. Commit and push (extension is distributed via GitHub)

## Testing Notes

Tests use Vitest (195 tests). Test files mirror source structure:
- `tests/parser.test.ts` - Markdown parsing (38 tests)
- `tests/generator.test.ts` - QTI XML generation
- `tests/text-generator.test.ts` - Plain text export
- `tests/validator.test.ts` - Package validation
- `tests/linter.test.ts` - Markdown linting
- `tests/config.test.ts` - Config file loading
