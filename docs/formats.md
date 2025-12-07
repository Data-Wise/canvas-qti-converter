# Supported Formats

**Examify** accepts a simple Markdown-based format.

## Structure

!!! warning "Required Format"
    Questions **must** use `## N. Question` format (with the `##` prefix).

```markdown
# Quiz Title

# Section: Topic Name

## 1. Question text? [2 pts]

1)  First option
2)  **Correct option** ✓
3)  Third option

## 2. [TF] True/false statement. → True

## 3. [Essay, 10pts] Open-ended question.
```

### Key Elements

| Element | Syntax | Example |
|---------|--------|---------|
| **Quiz title** | `# Title` | `# Statistics Final Exam` |
| **Section** | `# Section: Name` | `# Section: Multiple Choice` |
| **Question** | `## N. Text` | `## 1. What is 2+2?` |
| **Points** | `[N pts]` | `## 1. Question [5 pts]` |

---

## Question Types

### Multiple Choice

Mark the correct answer with one of the supported markers.

```markdown
## 1. What is 2 + 2? [2 pts]

1)  Three
2)  **Four** ✓
3)  Five
```

!!! tip "Correct Answer Markers"
    Choose one of these markers for correct answers:

    | Marker | Example | Best For |
    |--------|---------|----------|
    | `**Bold**` | `2)  **Answer**` | Visual emphasis |
    | `✓` checkmark | `2)  Answer ✓` | Quick marking |
    | `[correct]` | `2)  Answer [correct]` | Quarto compatibility |
    | `*` prefix | `*2)  Answer` | Traditional format |

---

### True / False

Use `[TF]` tag or arrow syntax.

```markdown
## 2. [TF] The sky is blue.

*True
False
```

Or use arrow syntax for single-line format:

```markdown
## 3. The earth is round. → True

## 4. Water freezes at 50°C. → False
```

!!! tip "Arrow Syntax"
    Use `→ True` or `-> True` in the question header to auto-mark the answer.

---

### Multiple Answers

Use `[MultiAns]` tag for questions with multiple correct answers.

```markdown
## 5. [MultiAns] Which are measures of central tendency?

*a) Mean
*b) Median
c)  Standard deviation
*d) Mode
```

---

### Essay

Use `[Essay]` tag. No answer options needed.

```markdown
## 6. [Essay, 10pts] Explain the process of photosynthesis.

Provide at least three key steps in your explanation.
```

---

### Short Answer

Use `[Short]` tag for fill-in-the-blank questions.

```markdown
## 7. [Short] What Greek letter represents the population mean?

Answer: μ
```

---

### Numeric

Use `[Numeric]` tag with optional tolerance.

```markdown
## 8. Calculate the mean of 2, 4, 6, 8, 10. [3 pts] ± 0.1

Answer: 6
```

---

## Custom Points

Override default points per question using `[N pts]` syntax.

```markdown
## 1. Easy question [1 pt]

## 2. [Essay, 10pts] Difficult essay question.

## 3. Medium question [5 pts]
```

---

## LaTeX Math

Both inline and display math are supported.

```markdown
## 1. In regression, what does $\beta_1$ represent?

$$Y = \beta_0 + \beta_1 X + \epsilon$$

1)  The y-intercept
2)  **The slope** ✓
3)  The error term
```

Examify automatically converts:

- `$...$` → `\(...\)` (inline)
- `$$...$$` → `\[...\]` (display)

---

## Images

Reference local images using standard Markdown syntax. Images are automatically **bundled into the QTI package** with an `imsmanifest.xml` for Canvas compatibility.

```markdown
## 1. What does this graph show?

The graph below represents population growth over time. Observe the trend line carefully.

![Graph](assets/graph.png)

*a) Linear growth
b)  Exponential growth
```

### Supported Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| PNG | `.png` | Recommended for charts |
| JPEG | `.jpg`, `.jpeg` | Good for photos |
| GIF | `.gif` | Animated supported |
| SVG | `.svg` | Vector graphics (Canvas supported) |
| WebP | `.webp` | Modern format (Canvas supported) |

### Path Requirements

- Use **relative paths** from your Markdown file
- Images should be in a subfolder (e.g., `assets/`, `images/`, `figures/`)
- Paths are case-sensitive

```
quiz/
├── my-quiz.md
└── assets/
    ├── chart1.png
    └── diagram.svg
```

!!! success "How It Works"
    Examify:

    1. Finds all `![alt](path)` references in your questions
    2. Copies the image files to an `images/` folder in the package
    3. Generates `imsmanifest.xml` listing all resources
    4. Creates `<img>` tags with relative paths in the QTI XML

---

## Solution Blocks

Examify automatically ignores solution/proof blocks.

```html
<div class="proof solution">
  This content will NOT appear in Canvas.
</div>
```

!!! info "Quarto Compatibility"
    When using Quarto, wrap solutions in `<div class="solution">` or `<div class="proof">` to prevent them from appearing in the exported quiz.
