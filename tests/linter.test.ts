
import { describe, it, expect } from 'vitest';
import { lintMarkdown } from '../src/diagnostic/linter';

describe('Linter', () => {
  it('should pass for a valid quiz using [x] marker', () => {
    const input = `
# Quiz Title
## 1. Valid Question [1 pt]
1) Option A
2) Option B [x]
    `;
    const errors = lintMarkdown(input);
    expect(errors).toHaveLength(0);
  });

  it('should pass for a valid quiz using ✓ marker', () => {
    const input = `
# Quiz Title
## 1. Valid Question [1 pt]
1) Option A
2) Option B ✓
    `;
    const errors = lintMarkdown(input);
    expect(errors).toHaveLength(0);
  });

  it('should pass for a valid quiz using [correct] marker', () => {
    const input = `
# Quiz Title
## 1. Valid Question [1 pt]
1) Option A
2) Option B [correct]
    `;
    const errors = lintMarkdown(input);
    expect(errors).toHaveLength(0);
  });

  it('should report error for empty quiz', () => {
    const errors = lintMarkdown('');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('No questions found');
  });

  it('should report missing correct answer', () => {
    const input = `
# Quiz
## 1. Invalid Question
1) A
2) B
    `;
    const errors = lintMarkdown(input);
    expect(errors.some(e => e.message.includes('No correct answer marked'))).toBe(true);
  });

  it('should report insufficient options', () => {
    const input = `
# Quiz
## 1. Bad Question
1) A [x]
    `;
    const errors = lintMarkdown(input);
    expect(errors.some(e => e.message.includes('must have at least 2 options'))).toBe(true);
  });

  it('should report duplicate question IDs', () => {
       const input = `
# Quiz
## 1. Question A [1 pt]
1) A
2) B [x]

## 1. Question B [1 pt] (Duplicate ID)
1) A
2) B [x]
    `;
    // Note: Parser might auto-increment IDs if not strictly parsed,
    // but our parser respects "## 1." as ID 1.
    const errors = lintMarkdown(input);
    expect(errors.some(e => e.message.includes('Duplicate Question ID found: 1'))).toBe(true);
  });

  it('should include line numbers in error messages', () => {
    const input = `# Quiz

## 1. Valid Question [1 pt]
1) Option A
2) Option B [x]

## 2. Missing correct answer
1) A
2) B
`;
    const errors = lintMarkdown(input);
    const noCorrectError = errors.find(e => e.message.includes('No correct answer'));
    expect(noCorrectError).toBeDefined();
    expect(noCorrectError?.line).toBe(7); // Line 7 is where "## 2." starts
  });

  it('should include line numbers for insufficient options error', () => {
    const input = `# Quiz

## 1. Bad Question
1) A [x]
`;
    const errors = lintMarkdown(input);
    const optionsError = errors.find(e => e.message.includes('must have at least 2 options'));
    expect(optionsError).toBeDefined();
    expect(optionsError?.line).toBe(3); // Line 3 is where "## 1." starts
  });

  it('should include line numbers for duplicate ID errors', () => {
    const input = `# Quiz

## 1. Question A [1 pt]
1) A
2) B [x]

## 1. Question B [1 pt]
1) A
2) B [x]
`;
    const errors = lintMarkdown(input);
    const dupError = errors.find(e => e.message.includes('Duplicate Question ID'));
    expect(dupError).toBeDefined();
    expect(dupError?.line).toBe(3); // First occurrence of ID 1 is on line 3
  });

  // Deprecated marker warnings
  describe('Deprecated Marker Warnings', () => {
    it('should warn about **bold** marker for correct answers', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
1) Option A
2) **Option B**
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated') && e.message.includes('bold'));
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('warning');
      expect(warning?.line).toBe(5);
    });

    it('should warn about *prefix marker for correct answers', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
*a) Correct answer
b) Wrong answer
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated') && e.message.includes('prefix'));
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('warning');
      expect(warning?.line).toBe(4);
    });

    it('should warn about numbered *1) prefix marker', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
*1) Correct answer
2) Wrong answer
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated') && e.message.includes('prefix'));
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('warning');
    });

    it('should warn about bold marker with dash options', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
- Option A
- **Option B**
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated') && e.message.includes('bold'));
      expect(warning).toBeDefined();
    });

    it('should NOT warn about [x] marker', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
a) Option A
b) Option B [x]
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated'));
      expect(warning).toBeUndefined();
    });

    it('should NOT warn about ✓ checkmark marker', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
a) Option A
b) Option B ✓
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated'));
      expect(warning).toBeUndefined();
    });

    it('should NOT warn about [correct] marker', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
a) Option A
b) Option B [correct]
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated'));
      expect(warning).toBeUndefined();
    });

    it('should warn about bold marker even with LaTeX in option', () => {
      const input = `
# Quiz
## 1. Question [1 pt]
a) $x = 1$
b) **$x = 2$**
`;
      const errors = lintMarkdown(input);
      const warning = errors.find(e => e.message.includes('Deprecated') && e.message.includes('bold'));
      expect(warning).toBeDefined();
    });
  });
});
