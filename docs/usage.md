# Usage Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/Data-Wise/examify.git
cd examify

# Install dependencies
npm install

# Build
npm run build

# Link globally (optional)
npm link
```

## Basic Conversion

```bash
examify questions.md
# Output: questions.qti.zip
```

### Options

| Option | Shorthand | Description |
|--------|-----------|-------------|
| `--output <file>` | `-o` | Specify output file path |
| `--validate` | `-v` | Validate structure after generating |
| `--preview` | | Show parsed questions in terminal |

## Diagnostics

Use the `verify` command to check an existing QTI package (zip or folder):

```bash
examify verify my-quiz.qti.zip
```

This performs:

1. Manifest validation
2. Resource existence checks
3. XML syntax validation
4. Canvas compatibility checks (duplicate IDs, interaction types)
