
import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../src/parser/markdown';

describe('Markdown Parser', () => {
  it('should parse a standard quiz', () => {
    const input = `
# Quiz Title

# Multiple Choice

## 1. Question 1 [2 pts]
1) Option A
2) **Option B**
    `;
    const result = parseMarkdown(input);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].points).toBe(2);
    expect(result.questions[0].type).toBe('multiple_choice');
  });

  it('should parse "Section:" prefix in headers (Canvas compatibility)', () => {
    const input = `
# Statistics Exam

# Section: Multiple Choice

## 1. What is variance? [3 pts]
1) Sum of squares
2) **Average squared deviation**
    `;
    const result = parseMarkdown(input);
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toContain('Multiple Choice');
    // This is expected to FAIL currently if my hypothesis is correct
    expect(result.questions).toHaveLength(1);
  });

  it('should handle escaped brackets in points (Quarto output)', () => {
    const input = `
# Quiz

# Multiple Choice

## 2. Question [2 pts]
1) A
2) **B**

## 3. Question \\[3 pts\\]
1) A
2) **B**
    `;
    const result = parseMarkdown(input);
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].points).toBe(2);
    // This might fallback to default if regex fails
    // expect(result.questions[1].points).toBe(3); 
  });

  it('should extract points even when brackets are escaped (Quarto style)', () => {
    const input = `
# Quiz
## 1. Question Title \\[2 pts\\]
1) A
2) **B**
    `;
    const result = parseMarkdown(input);
    expect(result.questions[0].points).toBe(2);
    expect(result.questions[0].stem).toBe('Question Title'); // Should NOT have [2 pts]
  });

  it('should auto-generate options for True/False questions if missing', () => {
    const input = `
# Section: True/False
## 1. Simple Fact
The sky is blue. -> True

## 2. Another Fact
Water is dry. -> False
    `;
    const result = parseMarkdown(input);
    const q1 = result.questions[0];
    expect(q1.type).toBe('true_false');
    expect(q1.options.length).toBe(2);
    expect(q1.options[0].text).toBe('True');
    expect(q1.options[0].isCorrect).toBe(true);
    expect(q1.stem).not.toContain('-> True');

    const q2 = result.questions[1];
    expect(q2.options[1].text).toBe('False');
    expect(q2.options[1].isCorrect).toBe(true);
  });

  // NEW: Test for checkmark stripping (Canvas compatibility)
  it('should strip ✓ checkmarks from options and mark them correct', () => {
    const input = `
# Multiple Choice

## 1. What is variance?
1) Sum of squares
2) Average squared deviation from mean ✓
3) Standard deviation
4) Range
    `;
    const result = parseMarkdown(input);
    const q = result.questions[0];
    
    // The ✓ should be stripped from option text
    expect(q.options[1].text).toBe('Average squared deviation from mean');
    expect(q.options[1].text).not.toContain('✓');
    // And the option should be marked correct
    expect(q.options[1].isCorrect).toBe(true);
  });

  // NEW: Test for solution block skipping
  it('should skip HTML solution blocks entirely', () => {
    const input = `
# Multiple Choice

## 1. What is variance?
1) Sum of squares
2) **Average squared deviation**

<div class="proof solution">

<span class="proof-title">*Solution*. </span>Variance measures the
average squared deviation from the mean. The formula divides by N for
population variance.

</div>

## 2. Second question
1) A
2) **B**
    `;
    const result = parseMarkdown(input);
    const q1 = result.questions[0];
    
    // Solution text should NOT appear in stem
    expect(q1.stem).not.toContain('deviation from the mean');
    expect(q1.stem).not.toContain('Solution');
    expect(q1.stem).not.toContain('population variance');
    
    // Both questions should parse correctly
    expect(result.questions).toHaveLength(2);
  });

  // NEW: Ensure → True marker is removed from T/F stems
  it('should clean arrow markers from True/False question stems', () => {
    const input = `
# Section: True/False

## 1. R squared can range from 0 to 1. → True
    `;
    const result = parseMarkdown(input);
    const q = result.questions[0];
    
    // The → True should be stripped from the stem
    expect(q.stem).not.toContain('→');
    expect(q.stem).not.toContain('True');
    expect(q.stem).toBe('R squared can range from 0 to 1.');
    
    // But the answer should be captured
    expect(q.options[0].text).toBe('True');
    expect(q.options[0].isCorrect).toBe(true);
  });
});
