# VS Code Snippets

Examify includes built-in snippets for fast exam authoring in VS Code, Positron, and VS Codium.

## Installation

The snippets are included in the repository. To use them:

1. Clone or download Examify
2. Open the folder in VS Code/Positron
3. Start typing a prefix and press **Tab**

!!! tip "Project-Level Snippets"
    Copy `.vscode/examify.code-snippets` to any project to get snippets there too.

## Available Snippets

### Question Types

| Prefix | Expands To |
|--------|------------|
| `mcq` | Multiple choice (4 options) |
| `mcq5` | Multiple choice (5 options) |
| `tfq` | True/False question (compact) |
| `tf` | True/False with explicit options |
| `essay` | Essay question |
| `short` | Short answer with auto-grading |
| `numeric` | Numeric with tolerance |
| `multians` | Multiple answer (select all that apply) |

### Structure

| Prefix | Expands To |
|--------|------------|
| `examhead` | Exam pool + section headers |
| `section` | Section header |
| `pool` | Question pool header |

### Figures & Images

| Prefix | Expands To |
|--------|------------|
| `mcqimg` | Question with embedded image |
| `rfig` | R code chunk for figures (Quarto) |
| `pyfig` | Python code chunk for figures (Quarto) |

### Other

| Prefix | Expands To |
|--------|------------|
| `solution` | Solution block (hidden in student version) |
| `examyaml` | Quarto YAML header |
| `imath` | Inline LaTeX math |
| `dmath` | Display LaTeX block |
| `statq` | Statistics formula question |

## Usage Example

Type `mcq` and press Tab:

```markdown
## 1. Question text [2 pts]

a) Option A
b) Option B
c) **Correct Answer** ✓
d) Option D
```

Use **Tab** to jump between placeholders.

## Customizing

Edit `.vscode/examify.code-snippets` to add your own snippets or modify existing ones.

```json
"My Custom Question": {
  "prefix": "myq",
  "body": [
    "## ${1:1}. ${2:Question} [${3:2} pts]",
    "",
    "a) ${4:A}",
    "b) **${5:B}** ✓"
  ],
  "description": "My custom question type"
}
```
