import { describe, it, expect } from 'vitest';
import { generateText } from '../src/generator/text';
import type { ParsedQuiz } from '../src/parser/types';

describe('Plain Text Generator', () => {
  const mockQuiz: ParsedQuiz = {
    title: 'Statistics Exam',
    defaultPoints: 1,
    sections: [],
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        stem: 'What is the mean?',
        points: 2,
        options: [
          { id: 'a', text: 'Sum of values', isCorrect: false },
          { id: 'b', text: 'Average', isCorrect: true },
          { id: 'c', text: 'Median', isCorrect: false }
        ]
      },
      {
        id: 2,
        type: 'true_false',
        stem: 'Variance can be negative.',
        points: 1,
        options: [
          { id: 'a', text: 'True', isCorrect: false },
          { id: 'b', text: 'False', isCorrect: true }
        ]
      },
      {
        id: 3,
        type: 'essay',
        stem: 'Explain the central limit theorem.',
        points: 5,
        options: []
      },
      {
        id: 4,
        type: 'short_answer',
        stem: 'What is the capital of France?',
        points: 1,
        options: [
          { id: 'answer1', text: 'Paris', isCorrect: true }
        ]
      }
    ]
  };

  it('should generate plain text with title and questions', () => {
    const output = generateText(mockQuiz);

    expect(output).toContain('Statistics Exam');
    expect(output).toContain('What is the mean?');
    expect(output).toContain('a) Sum of values');
    expect(output).toContain('b) Average');
    expect(output).toContain('Variance can be negative.');
  });

  it('should include point values when showPoints is true', () => {
    const output = generateText(mockQuiz, { showPoints: true });

    expect(output).toContain('(2 pts)');
    expect(output).toContain('(1 pt)');
    expect(output).toContain('(5 pts)');
  });

  it('should include answer key when showAnswers is true', () => {
    const output = generateText(mockQuiz, { showAnswers: true });

    expect(output).toContain('ANSWER KEY');
    expect(output).toContain('1. B'); // Multiple choice
    expect(output).toContain('2. B'); // True/False (False)
    expect(output).toContain('4. Paris'); // Short answer
  });

  it('should exclude answer key when showAnswers is false', () => {
    const output = generateText(mockQuiz, { showAnswers: false });

    expect(output).not.toContain('ANSWER KEY');
  });

  it('should use numbered options when numbered is true', () => {
    const output = generateText(mockQuiz, { numbered: true });

    expect(output).toContain('1) Sum of values');
    expect(output).toContain('2) Average');
    expect(output).not.toContain('a) Sum of values');
  });

  it('should include blank lines for essay questions', () => {
    const output = generateText(mockQuiz, { blankLines: 3 });

    // Count underscores for essay response area
    const essaySection = output.split('Explain the central limit theorem')[1];
    const underlineLines = essaySection?.split('\n').filter(l => l.includes('___')).length || 0;
    expect(underlineLines).toBeGreaterThanOrEqual(3);
  });

  it('should handle matching questions', () => {
    const quizWithMatching: ParsedQuiz = {
      title: 'Matching Test',
      defaultPoints: 1,
      sections: [],
      questions: [
        {
          id: 1,
          type: 'matching',
          stem: 'Match the terms',
          points: 4,
          options: [],
          matchPairs: [
            { left: 'Mean', right: 'Σx/n' },
            { left: 'Variance', right: 'Σ(x-μ)²/n' }
          ]
        }
      ]
    };

    const output = generateText(quizWithMatching);

    expect(output).toContain('Mean');
    expect(output).toContain('Σx/n');
    expect(output).toContain('Variance');
    expect(output).toContain('Match the items');
  });

  it('should handle fill-in-multiple-blanks questions', () => {
    const quizWithFMB: ParsedQuiz = {
      title: 'FMB Test',
      defaultPoints: 1,
      sections: [],
      questions: [
        {
          id: 1,
          type: 'fill_in_multiple_blanks',
          stem: 'r ranges from [blank1] to [blank2]',
          points: 2,
          options: [],
          blanks: [
            { blankId: 'blank1', answers: ['-1'] },
            { blankId: 'blank2', answers: ['1', '+1'] }
          ]
        }
      ]
    };

    const output = generateText(quizWithFMB);

    expect(output).toContain('[blank1]');
    expect(output).toContain('[blank2]');
    expect(output).toContain('ANSWER KEY');
    expect(output).toContain('blank1=-1');
  });

  it('should include student name and date fields', () => {
    const output = generateText(mockQuiz);

    expect(output).toContain('Name:');
    expect(output).toContain('Date:');
  });
});
