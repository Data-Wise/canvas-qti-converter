import { parseMarkdown } from '../parser/markdown.js';
import type { ParsedQuiz, Question } from '../parser/types.js';

export interface LintError {
  line?: number;
  message: string;
  severity: 'error' | 'warning';
  context?: string;
}

/**
 * Check for deprecated correct answer markers in raw content
 * Deprecated markers: **bold**, * prefix
 * Recommended markers: [x], ✓, ✔, [correct]
 */
function checkDeprecatedMarkers(content: string, errors: LintError[]): void {
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for **bold** marker on option lines
    // Match: a) **text** or 1) **text** or - **text**
    if (line.match(/^[\s]*(?:\*)?[a-e1-9]\)\s+\*\*[^*]+\*\*/i) ||
        line.match(/^[\s]*-\s+\*\*[^*]+\*\*/)) {
      errors.push({
        line: lineNum,
        message: 'Deprecated: **bold** marker for correct answers. Use [x] or ✓ instead. Bold conflicts with LaTeX formulas and reveals answers in preview.',
        severity: 'warning',
        context: line.trim().substring(0, 50)
      });
    }

    // Check for * prefix marker (but not ** which is bold)
    // Match: *a) text or *1) text (asterisk before letter/number)
    if (line.match(/^[\s]*\*[a-e1-9]\)\s+/i) && !line.match(/^[\s]*\*\*/)) {
      errors.push({
        line: lineNum,
        message: 'Deprecated: *prefix marker for correct answers. Use [x] or ✓ instead. Asterisk prefix conflicts with Markdown lists.',
        severity: 'warning',
        context: line.trim().substring(0, 50)
      });
    }
  }
}

export function lintMarkdown(content: string): LintError[] {
  const errors: LintError[] = [];

  // Check for deprecated markers first (before parsing)
  checkDeprecatedMarkers(content, errors);

  const quiz = parseMarkdown(content);

  // 1. Check for empty quiz
  if (quiz.questions.length === 0) {
    errors.push({
      message: 'No questions found. Ensure headers start with ## and follow the correct format.',
      severity: 'error'
    });
    return errors;
  }

  // 2. Validate Questions
  quiz.questions.forEach((q, index) => {
    validateQuestion(q, errors, index + 1);
  });

  // 3. Check for Duplicate IDs
  const ids = quiz.questions.map(q => q.id);
  const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
  if (duplicates.length > 0) {
    const uniqueDupes = [...new Set(duplicates)];
    uniqueDupes.forEach(id => {
      // Find first question with this duplicate ID for line number
      const dupQuestion = quiz.questions.find(q => q.id === id);
      errors.push({
        line: dupQuestion?.sourceLine,
        message: `Duplicate Question ID found: ${id}`,
        severity: 'error'
      });
    });
  }

  return errors;
}

function validateQuestion(q: Question, errors: LintError[], index: number) {
  const context = `Question ${index} ("${q.stem.substring(0, 30)}...")`;
  const line = q.sourceLine;

  // Check Points
  if (!q.points || q.points <= 0) {
     // Parser defaults to 1 if missing, but we can check if the title contained [pts]
     // Actually, parser logic assigns defaultPoints=1 if extractPoints returns null.
     // So we can't strictly detect "missing" vs "default" easily unless we inspect raw title.
     // For now, let's trust the parser but maybe warn if it seems low?
     // Re-reading parser: extractPoints returns null if no match.
     // We might want to be strict about explicit points.
  }

  // Check Options based on Type
  if (q.type === 'multiple_choice' || q.type === 'multiple_answers' || q.type === 'true_false') {
    if (q.options.length < 2) {
      errors.push({
        line,
        message: `Question type '${q.type}' must have at least 2 options. Found ${q.options.length}.`,
        severity: 'error',
        context
      });
    }

    const correct = q.options.filter(o => o.isCorrect);
    if (correct.length === 0) {
      errors.push({
        line,
        message: 'No correct answer marked. Use [x] or ✓ to mark the correct option.',
        severity: 'error',
        context
      });
    }

    if (q.type === 'multiple_choice' && correct.length > 1) {
       errors.push({
         line,
         message: `Multiple correct answers found for 'multiple_choice'. Use 'Multiple Answer' type or ensure only one is correct.`,
         severity: 'warning',
         context
       });
    }
  }

  // Check Stem
  if (!q.stem || q.stem.trim().length === 0) {
    errors.push({
      line,
      message: 'Question is missing a question stem/text.',
      severity: 'error',
      context
    });
  }
}
