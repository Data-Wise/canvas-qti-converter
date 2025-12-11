# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Examark converts Markdown exam files to QTI 1.2 packages for Canvas LMS import.

- **Repo**: Data-Wise/examark
- **Docs**: https://data-wise.github.io/examark/
- **Version**: 0.6.6 | **Tests**: 235 (234 passing, 1 skipped)
- **Distribution**: npm (`examark`), Homebrew (`data-wise/tap/examark`), Quarto extension

## Recent Changes (Dec 2025)

**Quarto GFM Compatibility Enhancements (Dec 11):**
- Fixed: Inline code formatting - backticks now convert to `<code>` tags in QTI
- Fixed: R-generated figures from Quarto now bundled in QTI packages
- Fixed: Quarto figure divs (`<div id="fig-...">`) automatically included in question stems
- Fixed: Escaped comparison operators (`\<` and `\>` in GFM) now render correctly as `&lt;` and `&gt;`
- Fixed: HTML anchor tags with `class="quarto-xref"` no longer break parser
- Fixed: Multi-line HTML `<img>` tags now properly extracted and bundled
- Fixed: Quarto cross-reference anchors stripped from QTI output (replaced with plain text)
- Fixed: Negative numbers (e.g., `-0.678, SE = 0.289`) no longer treated as list items in parser
- Added: Figure content preprocessing to capture images before questions
- Added: HTML img tag support in image extraction and QTI generation
- Added: Test suite for Quarto GFM compatibility (6 new tests)
- Result: R plots, inline code, LaTeX math, comparison operators, and figure references all render correctly in Canvas

**Canvas Emulator Enhancements (Dec 11):**
- Added: `extractMattextHtml()` method to extract raw HTML from QTI packages (preserves `<code>`, `<img>`, LaTeX tags)
- Added: Quarto GFM compatibility tracking infrastructure in validator
- Modified: Validator now processes raw XML alongside parsed JSON for accurate HTML content analysis
- Infrastructure: Pre-scan logic for detecting inline code (12 found), LaTeX math (59 found), escaped operators (16 found)
- Status: Feature detection works, display output temporarily disabled pending debugging (TODO)
- Benefit: Foundation in place for future Quarto-aware QTI validation and reporting

**Positron IDE Integration (Dec 11):**
- Created VS Code task for one-command QTI generation: `./qti-render <file.qmd>`
- Global Positron keybinding: `Ctrl+Shift+Q` → Render + Generate QTI
- Fixed: Positron only reads global keybindings (`~/Library/Application Support/Positron/User/keybindings.json`)
- Fixed: Workspace keybindings (`.vscode/keybindings.json`) don't work in Positron
- Added informative exam configuration messages (not warnings) to Lua filter
- Changed exam-gfm defaults: `qti: true`, `solutions: false` by default
- QTI files generated in project root (same directory as `.qmd` source)
- Validated R-generated plots in QTI packages (6 diagnostic plots bundled successfully)

**Claude Skills Package (Dec 10):**
- Created comprehensive skill package in `.claude/skills/` (7 files + README)
- Claude Desktop skills: exam generation, formatting, example exam, quick reference
- Claude Code skills: Quarto generator, statistics-specific patterns
- Project setup guide for Claude Desktop integration
- All skills version-controlled and documented
- Test example: `examples/quarto/test-skill-output.qmd` (11 questions, verified workflow)

**Documentation Overhaul (Dec 9):**
- New "Markdown" section with 6 pages: question-types, syntax, latex, images, feedback, structure
- Reorganized navigation: Markdown / CLI Reference / Quarto Extension / Tutorials / Templates / Resources
- Added `docs/DESIGN.md` documenting site architecture and design principles
- Cleaned up project root (removed test artifacts, old files)
- Disabled Quarto caching (`execute.cache: false`) to prevent `*_files` folders

**v0.6.6 - Templates Reorganization:**
- Reorganized examples and templates into categorized folders:
  - `templates/markdown/` - Production-ready Markdown starters
  - `templates/quarto/` - Quarto starters with dynamic content
  - `examples/markdown/` - Demo/testing files
  - `examples/quarto/` - Quarto examples
- 39 Quarto extension tests (38 passing, 1 skipped)

## History

**v0.6.0** (Dec 2025): Renamed from `examify` to `examark` to avoid company name conflict.

**Backward Compatibility:**
- Config files: Both `.examarkrc.json` and `.examifyrc.json` supported
- npm: `examify` package redirects to `examark`
- Homebrew: `examify` formula redirects to `examark`
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
- 235 tests (234 passing, 1 skipped)
- Full backward compatibility for renamed project
- Comprehensive documentation site with Material theme

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

**Primary Users:** Statistics instructors using Quarto for dynamic exam generation.

**High-Impact, Low-Effort (Next Up):**
| Feature | Description | Use Case |
|---------|-------------|----------|
| Canvas screenshots | Show imported questions in docs | Help users understand output |
| Answer randomization | Shuffle answer options | Reduce cheating |
| Quarto post-render hook | Auto-run examark after render | Streamline workflow |
| Numeric ranges | `Answer: 5-10` syntax | Accept range of values |

**Medium-term:**
- Question pools/Item Banks workflow documentation
- QTI 2.1 export format (`src/generator/qti21.ts` exists, needs integration)
- Question weighting/partial credit
- More detailed error messages with line numbers
- Import from other quiz formats (Moodle XML, GIFT)

**Long-term:**
- Web UI for preview and editing
- Question bank management
- AI-assisted question generation
- LTI integration for direct Canvas publishing
- VS Code extension (syntax highlighting, preview)

### Research Notes (Dec 2025)

**Canvas Quiz Systems:**
- UNM Canvas: Both Classic and New Quizzes enabled, no migration deadline
- Canvas QTI 2.1: Supported in both quiz types
- New Quizzes: Stricter validation, same QTI format

**Question Banks vs Item Banks:**

| System | Quiz Type | QTI Import | Random Selection |
|--------|-----------|------------|------------------|
| **Question Banks** | Classic Quizzes | ✅ QTI 1.2/2.1 | Via Question Groups |
| **Item Banks** | New Quizzes | ✅ QTI 1.2/2.x | "Randomly select N" option |

**Import Paths (Both Work!):**

1. **Classic Quizzes:** Course Import → QTI package → Creates Quiz + Question Bank
2. **Item Banks (New Quizzes):** Manage Item Banks → Import Content → Upload QTI .zip
3. **New Quizzes:** Build Quiz → Import from QTI (creates new quiz only, cannot modify existing)

**Key Differences:**
- Question Banks: Course-specific
- Item Banks: User-owned, shareable across courses
- Both support QTI 1.2 and 2.1 imports

**Canvas Roadmap (Q4 2025 - Q1 2026):**
- Direct Item Bank import via Course Import (no need to attach to quiz first)
- Enhanced migration tools for Classic → New conversion
- Better API for third-party integrations

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
| Handle Quarto figure divs | `src/parser/markdown.ts:658-674` (figure block detection) |
| Skip HTML divs with class | `src/parser/markdown.ts:677-681` (skip `<div class=...>` but allow inline HTML) |
| Extract images from HTML | `src/parser/markdown.ts:298-315` (markdown + HTML img tags) |
| Process HTML img tags in QTI | `src/generator/qti.ts:46-59` (bundle HTML images) |
| Strip Quarto cross-refs | `src/generator/qti.ts:61-63` (remove `<a class="quarto-xref">` tags) |
| Format inline code | `src/generator/qti.ts:65-69` (backtick → `<code>` conversion) |
| Fix escaped characters | `src/generator/qti.ts:76-80` (remove Quarto `\<` and `\>` escapes) |

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

## Claude Skills

**Location**: `.claude/skills/` (7 skill files + README)

This project includes comprehensive Claude skills for exam generation. All skills are version-controlled in the repository.

### Skill Files

| File | Purpose | Target |
|------|---------|--------|
| `claude-desktop-exam-generation.md` | Question patterns & templates | Claude Desktop |
| `claude-desktop-examark-formatting.md` | Syntax rules & validation | Claude Desktop |
| `claude-desktop-project-setup-guide.md` | Setup instructions | Reference |
| `examark-example-exam.md` | 26-question working example | Claude Desktop |
| `examark-quick-reference.md` | One-page cheat sheet | Claude Desktop |
| `quarto-examark-generator.md` | Comprehensive Quarto guide | Claude Code |
| `statistics-exam-generator.md` | Statistics-specific patterns | Claude Code |

### For Claude Desktop App

**Setup**: Create a project and upload these 4 files:
1. `claude-desktop-exam-generation.md` - Core patterns
2. `claude-desktop-examark-formatting.md` - Syntax rules
3. `examark-example-exam.md` - Full example
4. `examark-quick-reference.md` - Cheat sheet

**Project Instructions**:
```
Generate exams in examark format for Canvas LMS.
Always use [x] markers (never **bold**).
Include LaTeX for math formulas.
Follow examark syntax rules.
```

### For Claude Code CLI

Skills are automatically available in this project:
- `quarto-examark-generator.md` - All question types, YAML config, R/Python dynamic content
- `statistics-exam-generator.md` - Stats topics, formulas, hypothesis testing

### Coverage

**Question Types**: All 8 types (MC, TF, MA, Essay, Short, Num, Match, FMB)
**Formats**: Markdown, Quarto (.qmd), all output formats
**Features**: LaTeX math, feedback, sections, dynamic content
**Subjects**: Statistics (primary), Math, Science

### Test Example

`examples/quarto/test-skill-output.qmd`:
- 11 questions across all major types
- Demonstrates feedback, LaTeX math, solutions
- Full render → convert → validate workflow verified

### Documentation

See `.claude/skills/README.md` for:
- Detailed file descriptions
- Upload instructions
- Usage examples
- Workflow guides

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

**Quarto GFM Compatibility Features:**
- R-generated figures from code chunks are automatically bundled in QTI packages
- Inline code (`` `code` ``) converts to HTML `<code>` tags
- LaTeX math (`$x$`) converts to Canvas format `\(x\)`
- Comparison operators (`<`, `>`) correctly escape to `&lt;` and `&gt;`
- Figure divs (`<div id="fig-...">`) automatically prepended to following questions

### Updating the Extension

After modifying `_extensions/exam/`:
1. Update version in `_extension.yml`
2. Test with `quarto render examples/minimal.qmd`
3. Commit and push (extension is distributed via GitHub)

## Positron IDE Workflow

For users working in Positron (Posit's data science IDE), the project includes integrated keyboard shortcuts and tasks.

### Quick Setup

1. **Keyboard Shortcut**: Press `Ctrl+Shift+Q` while editing a `.qmd` file
2. **Result**: Automatically renders Quarto + generates QTI package
3. **Output Location**: Project root (same directory as `.qmd` file)

### How It Works

**Global Keybinding** (required for Positron):
- Location: `~/Library/Application Support/Positron/User/keybindings.json`
- Why: Positron doesn't read workspace keybindings (`.vscode/keybindings.json`)
- Shortcut: `Ctrl+Shift+Q` (uses Ctrl to avoid macOS conflicts)

**VS Code Task**:
- Location: `.vscode/tasks.json`
- Command: `./qti-render ${file}`
- Also accessible via: `Cmd+Shift+P` → "Run Build Task"

**QTI Render Script**:
```bash
./qti-render EXAM_FILE.qmd
```
- Runs `quarto render` to generate `.md`
- Checks `exam.qti: true` in YAML
- Runs `examark` to generate `.qti.zip`
- Shows informative configuration messages

### Exam Configuration Messages

When rendering with `exam-gfm` format, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Exam Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 QTI Generation:  ✓ Enabled
  📝 Solutions:       ✗ Hidden (student version)

  💡 Tip: Enable solutions to preview answers before
     finalizing your exam:

     exam:
       solutions: true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

These are **informative messages** (not warnings) to help users understand their configuration.

### Default Settings (exam-gfm)

As of Dec 11, 2025, `exam-gfm` format defaults to:
- `qti: true` - Auto-generate QTI (that's what GFM is for!)
- `solutions: false` - Hide answers by default (safer)
- `include-answers: true` - Include answer markers in markdown

**Rationale**: Users rendering to `exam-gfm` are creating QTI packages, so it makes sense to enable QTI generation by default.

### Troubleshooting

**Shortcut doesn't work:**
1. Reload Positron: `Cmd+Shift+P` → "Developer: Reload Window"
2. Verify keybinding is in global file (not workspace)
3. Check `when` clause: `editorLangId == 'quarto' && resourceExtname == .qmd`

**QTI file not found:**
- File is in **project root**, not `_output/` directory
- Same location as your `.qmd` source file
- Refresh file explorer in Positron if needed

**Alternative method:**
Use Command Palette: `Cmd+Shift+P` → "Tasks: Run Task" → "Render Exam + Generate QTI"

## Testing Notes

Tests use Vitest (233 tests). Test files mirror source structure:
- `tests/parser.test.ts` - Markdown parsing (38 tests)
- `tests/generator.test.ts` - QTI XML generation
- `tests/text-generator.test.ts` - Plain text export
- `tests/validator.test.ts` - Package validation
- `tests/linter.test.ts` - Markdown linting
- `tests/config.test.ts` - Config file loading
- `tests/quarto-extension.test.ts` - Quarto extension (39 tests)
- `tests/templates.test.ts` - Template files
- `tests/website.test.ts` - Documentation site

## Documentation Site

The website (https://data-wise.github.io/examark/) uses MkDocs with Material theme.

### Site Structure

```
docs/
├── index.md                    # Homepage
├── getting-started.md          # Quick start guide
├── DESIGN.md                   # Site design documentation
├── markdown/                   # Markdown syntax section
│   ├── index.md               # Overview + quick reference
│   ├── question-types.md      # Visual gallery (8 types)
│   ├── syntax.md              # Complete syntax reference
│   ├── latex.md               # LaTeX math guide
│   ├── images.md              # Image bundling
│   ├── feedback.md            # Feedback options
│   └── structure.md           # Document organization
├── reference/
│   └── yaml-options.md        # YAML config reference
├── extensions/
│   └── quarto.md              # Quarto extension guide
├── tutorials/                  # Step-by-step guides
├── starter/                    # Template documentation
├── DESIGN.md                   # Documentation architecture
├── config.md                   # Configuration
├── emulator.md                 # Canvas emulator
├── reference.md                # CLI commands
├── troubleshooting.md          # Common issues
└── contributing.md             # Developer guide
```

### Navigation

```yaml
nav:
  - Home
  - Getting Started
  - Markdown/              # Syntax documentation
  - CLI Reference/         # Commands, config, emulator
  - Quarto Extension/
  - Tutorials/
  - Templates/
  - Resources/             # Troubleshooting, contributing
```

### Building Docs

```bash
# Build site
mkdocs build

# Serve locally
mkdocs serve

# Deploy (automatic via GitHub Actions)
```

### Design Principles

See `docs/DESIGN.md` for full documentation design guide:
- Progressive disclosure (simple → detailed)
- Task-oriented organization
- Two audience tracks (Markdown users vs Quarto/R users)
- Consistent page structure
