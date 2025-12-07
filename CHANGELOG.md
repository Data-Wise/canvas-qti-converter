# Changelog

All notable changes to this project will be documented in this file.

## [0.2.2] - 2025-12-07

### Added

- **`[correct]` Marker**: New Quarto-friendly way to mark correct answers without conflicts.
- **`[MultiAns]` Type**: Support for multiple-answer questions via `[MultiAns]` tag.
- **Type Markers**: Inline `[TF]`, `[Essay]`, `[Short]`, `[Numeric]` markers in question headers.
- **Canvas Import Emulator**: New `emulate-canvas` command predicts Canvas import success/failure.
- **Enhanced Validator**: Canvas-specific checks for correct answers, interaction types, and images.

### Fixed

- **Parser**: `*a)` asterisk-prefix options now correctly mark answers.
- **Parser**: Both `→` (Unicode) and `->` (ASCII) arrows work for T/F answers.
- **Parser**: Standalone `*True`/`*False` options now parse correctly.

### Tests

- Added 8 new tests (32 total tests passing).

## [0.2.1] - 2025-12-06

### Fixed

- **Parser Artifacts**:
  - Stripped `✓`/`✔` checkmarks from option text (automatically marks them as correct).
  - Skipped HTML solution blocks (`<div class="solution">`) to prevent solution text from leaking into question stems.
  - Normalized and stripped `→ True/False` markers from question headers while correctly capturing the answer.

## [0.2.0] - 2023-12-07

### Added

- **QTI 2.1 Support**: Full support for generating QTI 2.1 packages compatible with Canvas.
- **Diagnostics**: New `verify` command to validate QTI packages.
  - Checks manifest structure, resource existence, and XML syntax.
  - Simulates Canvas import checks (duplicate IDs, interaction consistency).
- **Image Support**: Automatically detects, extracts, and packages images referenced in Markdown.
- **Points/Scoring**: Support for custom points per question.
- **Unit Tests**: Comprehensive test suite for validator and generator.

### Changed

- **Project Structure**: Reorganized into `src/`, `examples/`, `docs/`, and `scratch/`.
- **CLI**: Standardized CLI arguments and help output.

### Fixed

- Fixed assessment generation to correctly structure `test.xml` for Canvas quizzes.
