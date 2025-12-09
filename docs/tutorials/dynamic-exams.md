# Dynamic Exams with R & Python

This advanced tutorial covers programmatic exam generation using R and Python code in Quarto documents.

## Overview

Dynamic exams let you:

- **Randomize values** — Each student sees different numbers
- **Compute answers** — Correct answers calculated from the problem
- **Generate figures** — Create unique plots for each version
- **Scale easily** — One source file → many exam versions

---

## R Integration

### Basic Setup

Every dynamic exam starts with a setup chunk:

````markdown
```{r setup, include=FALSE}
# CRITICAL: Set seed for reproducibility
set.seed(42)  # Change for different versions

# Load packages
library(knitr)

# Configure chunks
knitr::opts_chunk$set(
  echo = FALSE,      # Hide code
  warning = FALSE,   # Hide warnings
  message = FALSE    # Hide messages
)
```
````

### Random Values Pattern

```r
# Generate random data
sample_size <- sample(20:50, 1)
sample_mean <- round(runif(1, 50, 100), 1)
sample_sd <- round(runif(1, 5, 15), 1)

# Compute derived values
std_error <- sample_sd / sqrt(sample_size)
t_critical <- qt(0.975, sample_size - 1)
margin_error <- t_critical * std_error

# Confidence interval bounds
ci_lower <- round(sample_mean - margin_error, 2)
ci_upper <- round(sample_mean + margin_error, 2)
```

### Creating Plausible Distractors

Good distractors are common student errors:

```r
correct_answer <- ci_upper - ci_lower  # Width of CI

# Distractor 1: Forgot to multiply by 2
wrong_1 <- margin_error

# Distractor 2: Used wrong t-value
wrong_2 <- round(1.96 * std_error * 2, 2)

# Distractor 3: Random plausible value
wrong_3 <- round(correct_answer * runif(1, 0.5, 0.8), 2)
```

### Full Question Example

````markdown
```{r ci-setup, include=FALSE}
set.seed(42)
n <- sample(25:40, 1)
xbar <- round(runif(1, 70, 90), 1)
s <- round(runif(1, 8, 15), 1)
se <- s / sqrt(n)
t_crit <- round(qt(0.975, n-1), 3)
me <- round(t_crit * se, 2)
ci_lower <- round(xbar - me, 2)
ci_upper <- round(xbar + me, 2)
```

## 1. Confidence Interval [3 pts]

A sample of n = `r n` students has a mean score of $\bar{x}$ = `r xbar` with standard deviation s = `r s`.

Calculate the 95% confidence interval for the population mean.

a) (`r ci_lower - 2`, `r ci_upper + 2`)
b) (`r ci_lower + 1`, `r ci_upper - 1`)
c) **(`r ci_lower`, `r ci_upper`)** [correct]
d) (`r xbar - s`, `r xbar + s`)

::: {.solution}
SE = s/√n = `r s`/√`r n` = `r round(se, 3)`

t* = `r t_crit` (df = `r n-1`)

ME = t* × SE = `r t_crit` × `r round(se, 3)` = `r me`

CI = (`r xbar` ± `r me`) = (`r ci_lower`, `r ci_upper`)
:::
````

---

## Generating Figures

### Histograms

````markdown
```{r hist-data, include=FALSE}
set.seed(42)
scores <- rnorm(100, mean = 75, sd = 12)
skewness_val <- round(moments::skewness(scores), 2)
```

```{r histogram, fig.cap="Distribution of Exam Scores"}
hist(scores, 
     main = "Exam Score Distribution",
     xlab = "Score",
     ylab = "Frequency",
     col = "steelblue",
     border = "white",
     breaks = 15)
abline(v = mean(scores), col = "red", lwd = 2, lty = 2)
```

## 2. Distribution Shape [2 pts]

Based on the histogram above, this distribution is:

a) Strongly positively skewed
b) Strongly negatively skewed
c) **Approximately symmetric** [correct]
d) Uniform
````

### Scatterplots with Regression

````markdown
```{r regression-setup, include=FALSE}
set.seed(42)
n <- 50
hours <- runif(n, 1, 10)
scores <- 45 + 5 * hours + rnorm(n, 0, 8)
model <- lm(scores ~ hours)
b0 <- round(coef(model)[1], 1)
b1 <- round(coef(model)[2], 2)
r_sq <- round(summary(model)$r.squared, 3)
```

```{r scatterplot, fig.cap="Study Hours vs Exam Score"}
plot(hours, scores,
     main = "Study Hours vs. Exam Score",
     xlab = "Hours Studied",
     ylab = "Exam Score",
     pch = 19,
     col = alpha("steelblue", 0.7))
abline(model, col = "red", lwd = 2)
mtext(paste0("ŷ = ", b0, " + ", b1, "x"), 
      side = 3, line = 0, cex = 0.9)
```
````

---

## Python Integration

### Setup with Jupyter

````markdown
```{python setup}
import numpy as np
import matplotlib.pyplot as plt
np.random.seed(42)
```

```{python values}
# Generate random data
n = np.random.randint(20, 50)
sample = np.random.normal(100, 15, n)
sample_mean = round(np.mean(sample), 1)
sample_std = round(np.std(sample, ddof=1), 1)
```
````

### Python Figures

````markdown
```{python histogram}
#| fig-cap: "Sample Distribution"
plt.figure(figsize=(8, 5))
plt.hist(sample, bins=15, color='steelblue', edgecolor='white')
plt.axvline(sample_mean, color='red', linestyle='--', linewidth=2)
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Sample Distribution')
plt.show()
```
````

---

## Creating Multiple Versions

### Strategy 1: Multiple Seeds

```bash
# build-versions.sh

for seed in 100 200 300; do
    sed -i '' "s/set.seed([0-9]*)/set.seed($seed)/" exam.qmd
    quarto render exam.qmd
    mv exam.md "version-${seed}.md"
    examark "version-${seed}.md" -o "version-${seed}.qti.zip"
done
```

### Strategy 2: Parameterized Documents

Create a wrapper script:

```r
# render_versions.R
versions <- c("A" = 100, "B" = 200, "C" = 300)

for (v in names(versions)) {
    quarto::quarto_render(
        "exam.qmd",
        output_file = paste0("exam-", v, ".md"),
        execute_params = list(seed = versions[[v]])
    )
}
```

With YAML parameters:

```yaml
---
params:
  seed: 42
---
```

```r
set.seed(params$seed)
```

---

## Advanced Patterns

### Conditional Question Types

Generate different question types based on random selection:

```r
question_type <- sample(c("ci", "hypothesis", "regression"), 1)

if (question_type == "ci") {
  # Generate CI question
} else if (question_type == "hypothesis") {
  # Generate hypothesis test question
} else {
  # Generate regression question
}
```

### Answer Validation

Ensure generated answers are valid:

```r
repeat {
  # Generate random values
  p_value <- runif(1, 0, 0.1)
  
  # Validate constraints
  if (p_value > 0.001 && p_value < 0.099) break
}
```

### Distractor Quality Check

```r
generate_distractors <- function(correct, n = 3) {
  distractors <- c()
  while (length(distractors) < n) {
    d <- correct + sample(c(-1, 1), 1) * runif(1, 1, 5)
    d <- round(d, 2)
    
    # Ensure distractor is different from correct and others
    if (abs(d - correct) > 0.5 && !d %in% distractors) {
      distractors <- c(distractors, d)
    }
  }
  distractors
}
```

---

## Workflow Checklist

- [ ] Set deterministic seed
- [ ] Test with multiple seeds to ensure validity
- [ ] Verify all computed answers are reasonable
- [ ] Check figure generation works
- [ ] Preview HTML before export
- [ ] Run Canvas emulator on each version
- [ ] Document which seed produces which version

---

## Troubleshooting

### Different Results Each Render

**Cause:** Seed not set or set after random operations

**Fix:** Put `set.seed()` at the very top of setup chunk

### Figures Not Embedded

**Cause:** Figure path issues

**Fix:** Ensure figures are in the same directory or use:

```yaml
knitr::opts_chunk$set(fig.path = "figures/")
```

### Math Not Rendering

**Cause:** Missing variant setting

**Fix:**

```yaml
format:
  exam-gfm:
    variant: +tex_math_dollars
```

### Inline R Code Shows Raw

**Cause:** Quarto processing issue

**Fix:** Ensure backticks are proper and R code is valid

---

## Templates

Download ready-to-use templates:

- [dynamic.qmd](https://github.com/Data-Wise/examark/blob/main/templates/quarto/dynamic.qmd) — Randomized questions with R
- [canvas-export.qmd](https://github.com/Data-Wise/examark/blob/main/examples/quarto/canvas-export.qmd) — Canvas-optimized example

---

## Next Steps

- [Extension Reference](../extensions/quarto.md) — All configuration options
- [Input Formats](../formats.md) — Question type syntax
- [Troubleshooting](../troubleshooting.md) — Common issues
