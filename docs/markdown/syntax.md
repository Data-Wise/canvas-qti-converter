# Syntax Reference

Complete reference for Examark's Markdown syntax.

---

## Document Structure

### Quiz Title

The first `# Title` line becomes the quiz/bank name:

```markdown
# Statistics Midterm Exam
```

### Sections

Group questions with section headers:

```markdown
# Section: Multiple Choice

1. [MC] First question... [2pts]

2. [MC] Second question... [2pts]

# Section: Essay Questions

3. [Essay] Essay prompt... [10pts]
```

Sections appear as question groups in Canvas.

---

## Question Syntax

### Clean Syntax (Recommended)

Numbered questions without `##` headers:

```markdown
1. [MC] What is the capital of France? [2pts]
a) London
b) Paris [x]
c) Berlin
```

**Requirements** (need at least one):

- Type marker: `[MC]`, `[TF]`, etc.
- Points: `[2pts]`, `[5 pts]`
- Follows a `# Section:` header

### Traditional Syntax

Uses `## N.` headers:

```markdown
## 1. What is the capital of France? [2 pts]

a) London
b) Paris [x]
c) Berlin
```

### Mixing Styles

Both styles can be used in the same file:

```markdown
# My Quiz

# Section: Quick Questions

1. [TF] The sky is blue. [1pt] → True

2. [TF] Water is dry. [1pt] → False

# Section: Detailed Questions

## 3. Explain the water cycle. [10 pts]

Describe evaporation, condensation, and precipitation.
```

---

## Answer Options

### Option Formats

All of these work:

```markdown
a) Option text
A) Option text
1) Option text
- Option text
```

### Correct Answer Markers

**Recommended markers** (LaTeX-safe, Quarto-compatible):

| Marker | Example | Notes |
|--------|---------|-------|
| `[x]` | `b) Paris [x]` | **Preferred** — Clean, explicit |
| `✓` | `b) Paris ✓` | Unicode checkmark |
| `✔` | `b) Paris ✔` | Alternative checkmark |
| `[correct]` | `b) Paris [correct]` | Verbose but clear |

**Deprecated markers** (still work, but not recommended):

| Marker | Example | Why Deprecated |
|--------|---------|----------------|
| `**bold**` | `b) **Paris**` | Conflicts with LaTeX, reveals answers in preview |
| `*` prefix | `*b) Paris` | Conflicts with Markdown lists |

!!! warning "LaTeX Compatibility"
    Bold markers (`**answer**`) conflict with LaTeX formulas like `**$\bar{x}$**`.
    Always use `[x]` or `✓` when your answers contain math.

### Multiple Correct Answers

For `[MA]` (Multiple Answers) questions, mark each correct option:

```markdown
1. [MA] Which are prime? [3pts]
a) 2 [x]
b) 4
c) 7 [x]
d) 11 [x]
```

---

## Points

### Inline Points

```markdown
1. [MC] Question [2pts]
1. [MC] Question [2 pts]
1. [MC] Question [2pt]
1. [MC] Question [2 pt]
```

### Combined with Type

```markdown
1. [MC, 2pts] Question
1. [Essay, 10pts] Question
```

### Default Points

Questions without points default to 1 point. Override with config:

```json
{
  "defaultPoints": 2
}
```

Or CLI flag:

```bash
examark quiz.md -p 2
```

---

## Special Syntax

### True/False Arrow Syntax

Compact single-line format:

```markdown
1. [TF] The Earth is round. [1pt] → True
2. [TF] Fire is cold. [1pt] → False
```

Arrow formats: `→`, `->`, `=>` followed by `True` or `False`

### Matching Pairs

Use `=>` or `::` separators:

```markdown
1. [Match] Match capitals to countries [4pts]
- France => Paris
- Germany => Berlin
- Italy => Rome
```

Or:

```markdown
- France :: Paris
- Germany :: Berlin
```

### Fill-in-Multiple-Blanks

Define blanks in text and answers at end:

```markdown
1. [FMB] Complete the equation. [3pts]

The formula is [var1] equals [var2] times [var3].

[var1]: y, Y
[var2]: m, slope
[var3]: x, X
```

### Numeric Answers

Include tolerance with `±`:

```markdown
1. [Num] What is pi to 2 decimals? [2pts]

Answer: 3.14 ± 0.01
```

### Short Answer

Multiple accepted answers:

```markdown
1. [Short] Capital of France? [2pts]

Answer: Paris
Answer: paris
Answer: PARIS
```

---

## Comments and Metadata

### Inline Feedback

Use `//` for per-option feedback:

```markdown
a) London // That's in England
b) Paris [x] // Correct! The capital of France
c) Berlin // That's in Germany
```

### Question Instructions

Text after the stem becomes instructions:

```markdown
1. [Essay, 10pts] Explain photosynthesis.

Include at least three steps.
Mention chlorophyll and sunlight.
Use proper scientific terminology.
```

### Solution Blocks (Ignored)

Content in solution blocks is excluded from QTI:

```html
<div class="solution">
This won't appear in Canvas.
</div>
```

Or with Quarto:

```markdown
::: {.solution}
Hidden from Canvas export.
:::
```

---

## Escaping

### Literal Brackets

To include literal `[` `]` in text, they're usually fine unless they match a pattern:

```markdown
The array notation is arr[0].  # OK - doesn't match [MC], [x], etc.
```

### LaTeX in Options

Math works in options:

```markdown
a) $x = 5$
b) $x = 10$ [x]
c) $x = 15$
```

---

## Complete Example

```markdown
# Statistics Final Exam

# Section: Concepts

1. [MC] Which is a measure of central tendency? [2pts]
a) Variance // Measures spread, not center
b) Mean [x] // Correct! Average value
c) Range // Measures spread
d) Standard deviation // Also measures spread

2. [TF] Correlation implies causation. [1pt] → False

3. [MA] Select all valid probability values. [2pts]
a) 0 [x]
b) 0.5 [x]
c) 1.5
d) 1 [x]

# Section: Calculations

4. [Num] Calculate: $\bar{x}$ for data: 2, 4, 6 [3pts]

$$\bar{x} = \frac{\sum x_i}{n}$$

Answer: 4 ± 0

5. [FMB] Complete the z-score formula. [2pts]

$z = \frac{x - [param1]}{[param2]}$

[param1]: μ, mu, mean
[param2]: σ, sigma, standard deviation, sd

# Section: Written Response

6. [Essay, 15pts] Explain the Central Limit Theorem.

Your answer should include:
- Definition
- Conditions
- Real-world application
```

---

## See Also

- [Question Types](question-types.md) — Visual examples of each type
- [LaTeX Math](latex.md) — Math formatting
- [Feedback](feedback.md) — Feedback options
