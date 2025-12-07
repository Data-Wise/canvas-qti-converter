# Supported Formats

The converter accepts a simple Markdown-based format.

## Structure

```markdown
# Pool: Question Bank Name
Points: 1

---

## Section: Topic 1
Instructions for this section.

1. Question text?
   *a) Correct answer
   b) Wrong answer
```

## Question Types

### Multiple Choice

Mark the correct answer with one of the supported markers.

```markdown
1. What is 2 + 2?
   a) 3
   *b) 4
   b) 4 [correct]
   c) 5

2. What is variance?
   a) Sum of squares
   b) Average squared deviation ✓
```

> [!TIP]
> **Correct answer markers** (choose one):
>
> - `*b)` - Asterisk prefix
> - `b) Answer ✓` - Checkmark suffix
> - `b) Answer [correct]` - **Recommended for Quarto** (no conflicts)
> - `b) **Answer**` - Bold text

### Multiple Answers

Use `[MultiAns]` tag for questions with multiple correct answers.

```markdown
3. [MultiAns] Which are measures of central tendency?
   *a) Mean
   *b) Median
   c) Standard deviation
   *d) Mode
```

### True / False

Use `[TF]` tag.

```markdown
2. [TF] The sky is blue.
   *True
   False

3. Water is wet. -> True
```

> [!TIP]
> You can also use arrow syntax `-> True` or `→ True` in the question header or text to automatically mark the answer.

### Essay

Use `[Essay]` tag.

```markdown
3. [Essay] Explain the process of photosynthesis.
```

### Short Answer

Not explicitly tagged, but defined by providing text answers without choices? (Requires verifying implementation detail, usually strictly defined or treated as essay if no choices).

## Custom Points

Override default points per question.

```markdown
4. [Essay, 10pts] A hard question.
```

## Images

Reference local images using standard Markdown syntax. They will be bundled into the package.

```markdown
5. What does this graph show?
   ![Graph](assets/graph.png)
   
   *a) Linear growth
   b) Exponential growth
```

## Ignored Content

The converter automatically skips solution blocks to prevent them from leaking into question text.

```html
<div class="solution">
  <p>This text will be completely ignored.</p>
</div>
```

Any content inside `<div class="solution">` or `<div class="proof">` is discarded.
