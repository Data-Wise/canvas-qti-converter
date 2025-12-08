/**
 * Plain text generator for printable exams
 * Generates a clean, formatted text file suitable for printing
 */

import type { ParsedQuiz, Question } from '../parser/types.js';

export interface TextExportOptions {
  showAnswers?: boolean;      // Include answer key at the end
  showPoints?: boolean;       // Show point values
  numbered?: boolean;         // Use numbered options (1, 2, 3) vs lettered (a, b, c)
  blankLines?: number;        // Lines for written responses (essay/short answer)
}

const DEFAULT_OPTIONS: TextExportOptions = {
  showAnswers: true,
  showPoints: true,
  numbered: false,
  blankLines: 5,
};

/**
 * Generate plain text exam from parsed quiz
 */
export function generateText(quiz: ParsedQuiz, options: TextExportOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];
  const answerKey: string[] = [];

  // Title
  lines.push(quiz.title);
  lines.push('='.repeat(quiz.title.length));
  lines.push('');

  // Instructions
  lines.push('Name: _______________________________    Date: _______________');
  lines.push('');

  let currentSection = '';
  let questionNum = 0;

  for (const question of quiz.questions) {
    questionNum++;

    // Section header if changed
    if (question.section && question.section !== currentSection) {
      currentSection = question.section;
      const sectionTitle = formatSectionTitle(currentSection);
      lines.push('');
      lines.push(sectionTitle);
      lines.push('-'.repeat(sectionTitle.length));
      lines.push('');
    }

    // Question stem with optional points
    const pointsStr = opts.showPoints ? ` (${question.points} pt${question.points !== 1 ? 's' : ''})` : '';
    lines.push(`${questionNum}. ${question.stem}${pointsStr}`);
    lines.push('');

    // Handle by question type
    switch (question.type) {
      case 'multiple_choice':
      case 'multiple_answers':
      case 'true_false':
        const correctAnswers: string[] = [];
        for (let i = 0; i < question.options.length; i++) {
          const opt = question.options[i];
          const prefix = opts.numbered
            ? `   ${i + 1}) `
            : `   ${String.fromCharCode(97 + i)}) `;
          lines.push(`${prefix}${opt.text}`);
          if (opt.isCorrect) {
            correctAnswers.push(opts.numbered ? String(i + 1) : String.fromCharCode(65 + i));
          }
        }
        answerKey.push(`${questionNum}. ${correctAnswers.join(', ')}`);
        break;

      case 'short_answer':
      case 'fill_in_blank':
        lines.push('   Answer: ' + '_'.repeat(40));
        const shortAnswer = question.options.find(o => o.isCorrect)?.text || '';
        answerKey.push(`${questionNum}. ${shortAnswer}`);
        break;

      case 'essay':
        for (let i = 0; i < (opts.blankLines || 5); i++) {
          lines.push('   ' + '_'.repeat(60));
        }
        answerKey.push(`${questionNum}. (Essay - see rubric)`);
        break;

      case 'numerical':
        lines.push('   Answer: ' + '_'.repeat(20));
        const numAnswer = question.options.find(o => o.isCorrect)?.text || '';
        answerKey.push(`${questionNum}. ${numAnswer}`);
        break;

      case 'matching':
        if (question.matchPairs) {
          lines.push('   Match the items:');
          lines.push('');
          // Left column with blanks
          for (let i = 0; i < question.matchPairs.length; i++) {
            const pair = question.matchPairs[i];
            lines.push(`   ___ ${i + 1}. ${pair.left}`);
          }
          lines.push('');
          // Right column (shuffled in real exam, but we show in order)
          for (let i = 0; i < question.matchPairs.length; i++) {
            const pair = question.matchPairs[i];
            lines.push(`       ${String.fromCharCode(65 + i)}. ${pair.right}`);
          }
          // Answer key
          const matchAnswers = question.matchPairs.map((_, i) => `${i + 1}-${String.fromCharCode(65 + i)}`);
          answerKey.push(`${questionNum}. ${matchAnswers.join(', ')}`);
        }
        break;

      case 'fill_in_multiple_blanks':
        if (question.blanks) {
          for (const blank of question.blanks) {
            lines.push(`   [${blank.blankId}]: ` + '_'.repeat(30));
          }
          const blankAnswers = question.blanks.map(b => `${b.blankId}=${b.answers[0]}`);
          answerKey.push(`${questionNum}. ${blankAnswers.join(', ')}`);
        }
        break;
    }

    lines.push('');
  }

  // Answer key (optional)
  if (opts.showAnswers) {
    lines.push('');
    lines.push('');
    lines.push('ANSWER KEY');
    lines.push('==========');
    lines.push('');
    for (const answer of answerKey) {
      lines.push(answer);
    }
  }

  return lines.join('\n');
}

/**
 * Format section ID into readable title
 */
function formatSectionTitle(sectionId: string): string {
  return sectionId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
