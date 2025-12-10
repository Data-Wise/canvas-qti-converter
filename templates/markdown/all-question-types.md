# Canvas Quiz - Statistics 101
<!--
============================================================
CANVAS-READY TEMPLATE
============================================================

This template includes all question types supported by Canvas 
Classic Quizzes. Use this as a reference for the full syntax.

Workflow:
  1. Edit this file with your questions
  2. examark canvas-ready.md -o quiz.qti.zip
  3. Upload quiz.qti.zip to Canvas (Settings → Import Content)

Verify before upload:
  examark emulate-canvas quiz.qti.zip

============================================================
-->

# Section: Conceptual Understanding

## 1. Measures of Central Tendency [2 pts]

Which measure of central tendency is most affected by extreme outliers?

a) Mode
b) Median
c) Mean [x]
d) All are equally affected

## 2. Sample vs Population [2 pts]

A researcher surveys 500 randomly selected voters to predict election results. The 500 voters represent:

a) The population
b) A parameter
c) A sample [x]
d) A census

## 3. Correlation Interpretation [2 pts]

A correlation of r = -0.85 indicates:

a) A weak positive relationship
b) A weak negative relationship
c) A strong positive relationship
d) A strong negative relationship [x]

# Section: True/False Questions

## 4. [TF] Correlation values range from -1 to +1. → True

## 5. [TF] A p-value of 0.03 means there is a 3% chance the null hypothesis is true. → False

## 6. [TF] The standard deviation can never be negative. → True

## 7. [TF] Increasing sample size decreases the standard error. → True

## 8. [TF] The median is always equal to the mean in any distribution. → False

# Section: Mathematical Notation

## 9. Variance Formula [3 pts]

Which formula correctly represents sample variance?

a) $s^2 = \frac{\sum(X_i - \bar{X})^2}{n}$
b) $s^2 = \frac{\sum(X_i - \bar{X})^2}{n-1}$ [x]
c) $s = \sqrt{\frac{\sum(X_i - \mu)^2}{N}}$
d) $\sigma^2 = \frac{\sum(X_i - \mu)^2}{N}$

## 10. Z-Score Interpretation [2 pts]

A student has a z-score of $z = 2.0$ on an exam. This means:

a) The student scored 2 points above average
b) The student scored 2 standard deviations above the mean [x]
c) The student is in the 2nd percentile
d) The student scored twice the average

## 11. Quadratic Formula [2 pts]

Identify the quadratic formula:

a) $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ [x]
b) $$E = mc^2$$
c) $$a^2 + b^2 = c^2$$
d) $$\bar{x} = \frac{\sum x_i}{n}$$

# Section: Select All That Apply

## 12. [MultiAns, 4pts] Properties of Normal Distribution

Select ALL properties of a normal distribution:

a) Symmetric about the mean [x]
b) Always positively skewed
c) Mean equals median equals mode [x]
d) Bell-shaped curve [x]
e) Always has mean of zero

## 13. [MultiAns, 3pts] Valid Probability Values

Which of the following are valid probability values?

a) 0.5 [x]
b) 0 [x]
c) -0.3
d) 1 [x]
e) 1.5

# Section: Short Answer

## 14. [Short] The statistical test used to compare means from two independent groups is called a

Answer: t-test

## 15. [Short, 2pts] What Greek letter represents population standard deviation?

Answer: sigma

## 16. [Short] The probability of rejecting a true null hypothesis is called

Answer: alpha

# Section: Image-Based Questions

## 17. Interpreting Graphs [3 pts]

Examine the histogram below and identify the shape of the distribution.

![Sample Histogram](assets/sample-graph.svg)

a) Symmetric [x]
b) Positively skewed
c) Negatively skewed
d) Bimodal

# Section: Code Examples

## 18. R Programming [2 pts]

What does the following R code compute?

```r
mean(c(10, 20, 30, 40, 50))
```

a) 50
b) 30 [x]
c) 150
d) 25

## 19. Python Code [2 pts]

What is the output of this Python code?

```python
import statistics
data = [2, 4, 6, 8, 10]
print(statistics.median(data))
```

a) 5
b) 6 [x]
c) 6.0
d) 30

# Section: Essay Questions

## 20. [Essay, 10pts] Statistical vs Practical Significance

Explain the difference between statistical significance and practical significance. Provide an example of a study where results might be statistically significant but not practically significant.

## 21. [Essay, 15pts] Regression Analysis

A researcher is studying the relationship between study hours and exam scores.

1. Explain what the coefficient of determination (R²) tells us
2. Describe how to interpret the slope of the regression line
3. Discuss at least two assumptions that must be met for linear regression

<!--
============================================================
CANVAS IMPORT NOTES
============================================================

Question Types Supported by Canvas Classic Quizzes:
  - Multiple Choice (default)
  - True/False [TF]
  - Multiple Answers [MultiAns]
  - Short Answer [Short]
  - Numeric [Numeric]
  - Essay [Essay]

Answer Markers (recommended):
  - [x]                - Checkbox marker (preferred)
  - ✓                  - Checkmark (also works)
  - [correct]          - Explicit marker

LaTeX Math:
  - Inline: $x^2$
  - Display: $$\sum_{i=1}^n x_i$$
  - Canvas renders these with MathJax

Images:
  - Use relative paths: ![caption](path/to/image.png)
  - Images are bundled in the QTI package automatically
  - Supported formats: PNG, JPG, SVG, GIF, WebP

Common Import Issues:
  - Each MC question needs exactly one correct answer
  - MultiAns questions can have multiple correct answers
  - Short answer is case-insensitive in Canvas
  - Numeric answers need proper tolerance (e.g., ± 0.01)

============================================================
-->
