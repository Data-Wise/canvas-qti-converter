# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Examify converts Markdown exam files to QTI 1.2 packages for Canvas LMS import.

- **Repo**: Data-Wise/examify
- **Docs**: https://data-wise.github.io/examify/
- **Version**: 0.4.2 | **Tests**: 188 passing
- **Distribution**: npm (`examify`), Homebrew (`data-wise/tap/examify`)

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
examify input.md -o output.qti.zip    # Convert to QTI (default)
examify input.md -f text              # Export as plain text for printing
examify input.md -f text --no-answers # Exclude answer key from text
examify input.md -p 2                 # Set default points to 2
examify input.md -t "Final Exam"      # Override quiz title
examify input.md -v                   # Convert and validate output
examify input.md --preview            # Preview parsed questions (JSON)

# Batch conversion
examify *.md -o output/               # Convert all .md files to output/
examify exams/*.md -f text            # Export multiple files as text

# Validation and utilities
examify verify package.qti.zip         # Validate package structure
examify emulate-canvas package.qti.zip # Simulate Canvas import
examify check input.md                 # Lint markdown for errors
```

## Configuration File

Create `.examifyrc.json` or `examify.config.json` in your project:

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
├── config.ts             # loadConfig() - loads .examifyrc.json settings
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
1. Run `examify input.md --preview` to see parsed JSON
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

1. Work on `dev` branch - merge to `main` only for releases
2. Always run `npm run build` before testing
3. Generated test output goes in `scratch/`
4. Version sync: `npm version patch` auto-updates version in `src/index.ts`

## Testing Notes

Tests use Vitest (188 tests). Test files mirror source structure:
- `tests/parser.test.ts` - Markdown parsing (38 tests)
- `tests/generator.test.ts` - QTI XML generation
- `tests/text-generator.test.ts` - Plain text export
- `tests/validator.test.ts` - Package validation
- `tests/linter.test.ts` - Markdown linting
- `tests/config.test.ts` - Config file loading
