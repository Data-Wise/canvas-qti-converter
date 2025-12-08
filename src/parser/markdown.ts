/**
 * Markdown parser for quiz questions
 * Supports both original format AND Quarto GFM output
 */

import type { ParsedQuiz, Question, Section, AnswerOption, QuestionType, MatchPair, BlankAnswer } from './types.js';
import { slugify } from './types.js';

/**
 * Type marker aliases - maps various formats to canonical QuestionType
 * All lookups are case-insensitive
 */
const TYPE_MARKER_ALIASES: Record<string, QuestionType> = {
  // True/False
  'tf': 'true_false',
  'truefalse': 'true_false',
  'true/false': 'true_false',
  't/f': 'true_false',

  // Multiple Choice (default, but can be explicit)
  'mc': 'multiple_choice',
  'multichoice': 'multiple_choice',
  'multiple choice': 'multiple_choice',

  // Multiple Answers (select all that apply)
  'ma': 'multiple_answers',
  'multians': 'multiple_answers',
  'multianswer': 'multiple_answers',
  'multiple answers': 'multiple_answers',
  'selectall': 'multiple_answers',
  'select all': 'multiple_answers',

  // Essay
  'essay': 'essay',
  'long answer': 'essay',
  'longanswer': 'essay',

  // Short Answer
  'short': 'short_answer',
  'sa': 'short_answer',
  'shortanswer': 'short_answer',
  'short answer': 'short_answer',
  'fillblank': 'short_answer',
  'fill blank': 'short_answer',
  'fib': 'short_answer',

  // Numeric
  'num': 'numerical',
  'numeric': 'numerical',
  'numerical': 'numerical',
  'number': 'numerical',

  // Matching
  'match': 'matching',
  'matching': 'matching',
  'mat': 'matching',

  // Fill in Multiple Blanks
  'fmb': 'fill_in_multiple_blanks',
  'fillblanks': 'fill_in_multiple_blanks',
  'fill blanks': 'fill_in_multiple_blanks',
  'multiblanks': 'fill_in_multiple_blanks',
  'fitb': 'fill_in_multiple_blanks',
};

/**
 * Extract inline type markers like [TF], [Essay], [MultiAns], [Match], [FMB] from question title
 * Supports many aliases (case-insensitive): [TF], [TrueFalse], [True/False], [T/F], etc.
 * Returns the detected type and clean title without the marker
 */
function extractTypeMarker(title: string): { type: QuestionType | null; cleanTitle: string } {
  // Build regex pattern from all aliases
  const aliasPattern = Object.keys(TYPE_MARKER_ALIASES).map(a => a.replace(/[\/\s]/g, '[/\\s]?')).join('|');
  const markerRegex = new RegExp(`\\[(${aliasPattern})(?:,?\\s*\\d+\\s*pts?)?\\]`, 'i');

  const markerMatch = title.match(markerRegex);
  if (markerMatch) {
    // Normalize: lowercase and remove spaces/slashes for lookup
    const marker = markerMatch[1].toLowerCase().replace(/[\s\/]+/g, match =>
      match.includes('/') ? '/' : ' '
    );
    const cleanTitle = title.replace(markerMatch[0], '').trim();
    const type = TYPE_MARKER_ALIASES[marker];
    if (type) {
      return { type, cleanTitle };
    }
  }
  return { type: null, cleanTitle: title };
}

/**
 * Parse question type from title or section context
 */
function parseQuestionType(text: string, sectionTitle?: string): QuestionType {
  const lower = text.toLowerCase();
  
  // Check for inline type markers first (highest priority)
  const { type: markerType } = extractTypeMarker(text);
  if (markerType) return markerType;
  
  // Check question title for hints
  if (lower.includes('essay')) return 'essay';
  if (lower.includes('short') && lower.includes('answer')) return 'short_answer';
  if (lower.includes('fill') || lower.includes('blank')) return 'fill_in_blank';
  
  // Check section title for hints
  if (sectionTitle) {
    const sectionLower = sectionTitle.toLowerCase();
    if (sectionLower.includes('essay')) return 'essay';
    if (sectionLower.includes('true') || sectionLower.includes('false')) return 'true_false';
    if (sectionLower.includes('short')) return 'short_answer';
    if (sectionLower.includes('multi-part') || sectionLower.includes('multi part')) return 'essay';
  }
  
  return 'multiple_choice';
}

/**
 * Check if text represents True/False question
 */
function isTrueFalseQuestion(options: AnswerOption[]): boolean {
  if (options.length !== 2) return false;
  const texts = options.map(o => o.text.toLowerCase().trim());
  return texts.includes('true') && texts.includes('false');
}

/**
 * Extract inline feedback from option text (format: text // feedback)
 * Returns the clean text and optional feedback
 */
function extractInlineFeedback(text: string): { cleanText: string; feedback?: string } {
  const feedbackMatch = text.match(/^(.+?)\s*\/\/\s*(.+)$/);
  if (feedbackMatch) {
    return {
      cleanText: feedbackMatch[1].trim(),
      feedback: feedbackMatch[2].trim()
    };
  }
  return { cleanText: text };
}

/**
 * Check for correct answer markers in option text
 * Supports: **, ✓, ✔, [correct], [x]
 */
function hasCorrectMarker(text: string): boolean {
  return (
    text.includes('**') ||
    text.includes('✓') ||
    text.includes('✔') ||
    /\[correct\]\s*$/i.test(text) ||
    /\[x\]\s*$/i.test(text)
  );
}

/**
 * Remove correct answer markers from text
 */
function cleanCorrectMarkers(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/[✓✔]/g, '')
    .replace(/\s*\[correct\]\s*$/i, '')
    .replace(/\s*\[x\]\s*$/i, '')
    .trim();
}

/**
 * Parse answer options from lines following a question
 * Handles multiple formats:
 * - 1) Answer, 2) Answer (Quarto GFM numbered)
 * - a) Answer, b) Answer (lettered)
 * - Correct markers: **Bold**, ✓, [correct], [x], * prefix
 * - Inline feedback: text // feedback comment
 */
function parseOptions(lines: string[]): AnswerOption[] {
  const options: AnswerOption[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match numbered options: 1) Answer, 2) Answer, or *1) Answer (correct)
    const numMatch = trimmed.match(/^(\*)?(\d+)\)\s+(.+)$/);
    if (numMatch) {
      const hasAsteriskPrefix = !!numMatch[1];
      const text = numMatch[3];
      const { cleanText: textWithoutFeedback, feedback } = extractInlineFeedback(text);
      const isCorrect = hasAsteriskPrefix || hasCorrectMarker(textWithoutFeedback);
      const cleanText = cleanCorrectMarkers(textWithoutFeedback);
      options.push({
        id: String.fromCharCode(96 + parseInt(numMatch[2])), // 1->a, 2->b, etc.
        text: cleanText,
        isCorrect,
        feedback
      });
      continue;
    }

    // Match lettered options: a) Answer, b) Answer, or *a) Answer (correct)
    const letterMatch = trimmed.match(/^(\*)?([a-e])\)\s+(.+)$/i);
    if (letterMatch) {
      const hasAsteriskPrefix = !!letterMatch[1];
      const text = letterMatch[3];
      const { cleanText: textWithoutFeedback, feedback } = extractInlineFeedback(text);
      const isCorrect = hasAsteriskPrefix || hasCorrectMarker(textWithoutFeedback) || textWithoutFeedback.startsWith('*');
      const cleanText = cleanCorrectMarkers(textWithoutFeedback).replace(/^\*/, '').trim();
      options.push({
        id: letterMatch[2].toLowerCase(),
        text: cleanText,
        isCorrect,
        feedback
      });
      continue;
    }

    // Match dash options: - Answer or -  **Answer** (correct)
    const dashMatch = trimmed.match(/^-\s+(.+)$/);
    if (dashMatch) {
      const text = dashMatch[1];
      const { cleanText: textWithoutFeedback, feedback } = extractInlineFeedback(text);
      const isCorrect = hasCorrectMarker(textWithoutFeedback);
      const cleanText = cleanCorrectMarkers(textWithoutFeedback);
      options.push({
        id: String.fromCharCode(97 + options.length), // a, b, c, ...
        text: cleanText,
        isCorrect,
        feedback
      });
      continue;
    }

    // Match standalone True/False options: *True, *False, True, False (for T/F questions)
    const tfMatch = trimmed.match(/^(\*)?(True|False)$/i);
    if (tfMatch) {
      const isCorrect = !!tfMatch[1]; // Has leading asterisk
      const text = tfMatch[2]; // True or False
      options.push({
        id: text.toLowerCase() === 'true' ? 'a' : 'b',
        text: text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
        isCorrect
      });
      continue;
    }
  }

  return options;
}

/**
 * Extract points from title like "Question Title [2 pts]" or "[5 pts]"
 */
function extractPoints(title: string): { points: number | null; cleanTitle: string } {
  // Matches [2 pts], [2 points], \[2 pts\], etc.
  // We handle optional backslashes before brackets
  const match = title.match(/(?:\\\[|\[)(\d+)\s*pts?(?:\\\]|\])/i);
  if (match) {
    return {
      points: parseInt(match[1], 10),
      cleanTitle: title.replace(match[0], '').trim()
    };
  }
  return { points: null, cleanTitle: title };
}

/**
 * Extract distinct image paths from markdown text
 */
function extractImages(text: string): string[] {
  const images = new Set<string>();
  const regex = /!\[.*?\]\((.*?)(?:\s+".*?")?\)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    images.add(match[1]);
  }
  return Array.from(images);
}

/**
 * Parse matching pairs from lines
 * Supports separators: :: (double colon) or => (arrow)
 * Format: - Left :: Right  OR  - Left => Right
 */
function parseMatchPairs(lines: string[]): MatchPair[] {
  const pairs: MatchPair[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match: - Left :: Right or - Left => Right (both separators)
    const matchPairRegex = /^-\s+(.+?)\s*(?:::|=>)\s*(.+)$/;
    const match = trimmed.match(matchPairRegex);
    if (match) {
      pairs.push({
        left: match[1].trim(),
        right: match[2].trim()
      });
    }
  }

  return pairs;
}

/**
 * Parse options with feedback
 * Supports:
 * - Blockquote feedback: > feedback after option
 * - Inline feedback: text // feedback
 * - General feedback: > [feedback] text
 */
function parseOptionsWithFeedback(lines: string[]): { options: AnswerOption[]; generalFeedback?: string } {
  const options: AnswerOption[] = [];
  let generalFeedback: string | undefined;
  let lastOption: AnswerOption | null = null;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Check for feedback line (starts with >)
    if (trimmed.startsWith('>')) {
      const feedbackText = trimmed.replace(/^>\s*/, '').trim();

      // Check for general feedback marker: > [feedback] text
      if (feedbackText.match(/^\[feedback\]/i)) {
        generalFeedback = feedbackText.replace(/^\[feedback\]\s*/i, '').trim();
      } else if (lastOption) {
        // Attach to last option (append if already has inline feedback)
        if (lastOption.feedback) {
          lastOption.feedback += ' ' + feedbackText;
        } else {
          lastOption.feedback = feedbackText;
        }
      }
      continue;
    }

    // Match numbered options: 1) Answer, 2) Answer, or *1) Answer (correct)
    const numMatch = trimmed.match(/^(\*)?(\d+)\)\s+(.+)$/);
    if (numMatch) {
      const hasAsteriskPrefix = !!numMatch[1];
      const text = numMatch[3];
      const { cleanText: textWithoutFeedback, feedback } = extractInlineFeedback(text);
      const isCorrect = hasAsteriskPrefix || hasCorrectMarker(textWithoutFeedback);
      const cleanText = cleanCorrectMarkers(textWithoutFeedback);
      lastOption = {
        id: String.fromCharCode(96 + parseInt(numMatch[2])),
        text: cleanText,
        isCorrect,
        feedback
      };
      options.push(lastOption);
      continue;
    }

    // Match lettered options: a) Answer, b) Answer, or *a) Answer (correct)
    const letterMatch = trimmed.match(/^(\*)?([a-e])\)\s+(.+)$/i);
    if (letterMatch) {
      const hasAsteriskPrefix = !!letterMatch[1];
      const text = letterMatch[3];
      const { cleanText: textWithoutFeedback, feedback } = extractInlineFeedback(text);
      const isCorrect = hasAsteriskPrefix || hasCorrectMarker(textWithoutFeedback) || textWithoutFeedback.startsWith('*');
      const cleanText = cleanCorrectMarkers(textWithoutFeedback).replace(/^\*/, '').trim();
      lastOption = {
        id: letterMatch[2].toLowerCase(),
        text: cleanText,
        isCorrect,
        feedback
      };
      options.push(lastOption);
      continue;
    }

    // Match dash options: - Answer or - **Answer** (correct) (but not matching pairs)
    const dashMatch = trimmed.match(/^-\s+(.+)$/);
    if (dashMatch && !trimmed.includes('::') && !trimmed.includes('=>')) {
      const text = dashMatch[1];
      const { cleanText: textWithoutFeedback, feedback } = extractInlineFeedback(text);
      const isCorrect = hasCorrectMarker(textWithoutFeedback);
      const cleanText = cleanCorrectMarkers(textWithoutFeedback);
      lastOption = {
        id: String.fromCharCode(97 + options.length),
        text: cleanText,
        isCorrect,
        feedback
      };
      options.push(lastOption);
      continue;
    }

    // Match standalone True/False options
    const tfMatch = trimmed.match(/^(\*)?(True|False)$/i);
    if (tfMatch) {
      const isCorrect = !!tfMatch[1];
      const text = tfMatch[2];
      lastOption = {
        id: text.toLowerCase() === 'true' ? 'a' : 'b',
        text: text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
        isCorrect
      };
      options.push(lastOption);
      continue;
    }
  }

  return { options, generalFeedback };
}

/**
 * Extract blanks from stem text (format: [blank1], [blank2], etc.)
 * Also parses blank answers from lines (format: [blank1]: answer1, answer2)
 */
function parseBlanks(stem: string, lines: string[]): BlankAnswer[] {
  const blanks: BlankAnswer[] = [];

  // Find all [blankN] markers in stem
  const blankRegex = /\[blank(\d+)\]/gi;
  const blankIds = new Set<string>();
  let match;
  while ((match = blankRegex.exec(stem)) !== null) {
    blankIds.add(`blank${match[1]}`);
  }

  // Parse answers from lines: [blank1]: answer1, answer2
  for (const line of lines) {
    const trimmed = line.trim();
    const answerMatch = trimmed.match(/^\[blank(\d+)\]:\s*(.+)$/i);
    if (answerMatch) {
      const blankId = `blank${answerMatch[1]}`;
      const answers = answerMatch[2].split(',').map(a => a.trim()).filter(a => a);
      blanks.push({ blankId, answers });
    }
  }

  // For any blanks without explicit answers, add empty entry
  for (const blankId of blankIds) {
    if (!blanks.find(b => b.blankId === blankId)) {
      blanks.push({ blankId, answers: [] });
    }
  }

  return blanks.sort((a, b) => a.blankId.localeCompare(b.blankId));
}

/**
 * Parse full markdown content into structured quiz
 * Supports Quarto GFM output format
 */
export function parseMarkdown(content: string): ParsedQuiz {
  const lines = content.split('\n');
  
  let title = 'Quiz';
  let defaultPoints = 1;
  const sections: Section[] = [];
  const questions: Question[] = [];
  
  let currentSection: Section | null = null;
  let currentQuestion: Partial<Question> | null = null;
  let currentQuestionLines: string[] = [];
  let currentQuestionLine: number = 0; // Track line number where question starts
  let questionCounter = 0;
  let inCoverPage = true; // Skip cover page content
  let inSolutionBlock = false; // Track when inside <div class="solution">...</div>
  
  const finalizeQuestion = () => {
    if (!currentQuestion || !currentQuestion.stem) {
      currentQuestion = null;
      currentQuestionLines = [];
      return;
    }

    let type = currentQuestion.type || 'multiple_choice';
    let options: AnswerOption[] = [];
    let matchPairs: MatchPair[] | undefined;
    let blanks: BlankAnswer[] | undefined;
    let generalFeedback: string | undefined;

    // Handle matching questions
    if (type === 'matching') {
      matchPairs = parseMatchPairs(currentQuestionLines);
    }
    // Handle fill-in-multiple-blanks
    else if (type === 'fill_in_multiple_blanks') {
      blanks = parseBlanks(currentQuestion.stem || '', currentQuestionLines);
    }
    // Handle regular questions with potential feedback
    else {
      const parsed = parseOptionsWithFeedback(currentQuestionLines);
      options = parsed.options;
      generalFeedback = parsed.generalFeedback;

      // Auto-detect question type from options
      if (options.length > 0 && isTrueFalseQuestion(options)) {
        type = 'true_false';
      }

      // parse answer from stem if provided (e.g. -> True)
      if (type === 'true_false' && options.length === 0) {
        const answerMatch = currentQuestion.stem?.match(/(?:->|Answer:|Ans:)\s*(True|False)/i);
        const correctAnswer = answerMatch ? answerMatch[1].toLowerCase() : null;

        options.push({ id: 'a', text: 'True', isCorrect: correctAnswer === 'true' });
        options.push({ id: 'b', text: 'False', isCorrect: correctAnswer === 'false' });

        if (answerMatch && currentQuestion.stem) {
          currentQuestion.stem = currentQuestion.stem.replace(answerMatch[0], '').trim();
        }
      } else if (options.length === 0) {
        if (type === 'multiple_choice') {
          type = 'short_answer';
        }

        if (type === 'short_answer' || type === 'fill_in_blank') {
          const answerMatch = currentQuestion.stem?.match(/(?:Answer:|Ans:)\s*(.+)$/i);
          if (answerMatch) {
            const answerText = answerMatch[1].trim();
            options.push({ id: 'answer1', text: answerText, isCorrect: true });
            if (currentQuestion.stem) {
              currentQuestion.stem = currentQuestion.stem.replace(answerMatch[0], '').trim();
            }
          }
        }
      }
    }

    const question: Question = {
      id: currentQuestion.id!,
      type,
      stem: currentQuestion.stem,
      options,
      points: currentQuestion.points || defaultPoints,
      section: currentSection?.id,
      images: extractImages(currentQuestion.stem),
      sourceLine: currentQuestionLine || undefined,
      matchPairs: matchPairs?.length ? matchPairs : undefined,
      blanks: blanks?.length ? blanks : undefined,
      generalFeedback,
    };

    questions.push(question);

    if (currentSection) {
      currentSection.questionIds.push(question.id);
    }

    currentQuestion = null;
    currentQuestionLines = [];
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and horizontal rules
    if (!trimmed || trimmed === '---' || trimmed.match(/^-{3,}$/)) {
      continue;
    }
    
    // Track solution blocks: <div class="proof solution"> ... </div>
    if (trimmed.includes('<div') && (trimmed.includes('solution') || trimmed.includes('proof'))) {
      inSolutionBlock = true;
      continue;
    }
    if (trimmed.includes('</div>') && inSolutionBlock) {
      inSolutionBlock = false;
      continue;
    }
    if (inSolutionBlock) {
      continue; // Skip all content inside solution blocks
    }
    
    // Skip callout blocks and other metadata (but NOT feedback lines starting with >)
    if (trimmed.startsWith(':::') || trimmed.includes('class=')) {
      continue;
    }

    // Feedback lines (> text) - collect for options if we're in a question
    if (trimmed.startsWith('>') && currentQuestion) {
      currentQuestionLines.push(trimmed);
      continue;
    }
    // Skip other blockquotes when not in a question
    if (trimmed.startsWith('>') && !currentQuestion) {
      continue;
    }

    // Quiz title: # Title (first h1)
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match && !h1Match[1].match(/^(?:Section:\s*)?(Multiple|True|Short|Essay|Multi)/i)) {
      // This is the quiz title, not a section
      if (title === 'Quiz') {
        title = h1Match[1];
      }
      continue;
    }
    
    // Section: # Multiple Choice (10 points) or # True/False (5 points)
    // Also supports: # Section: Multiple Choice
    if (h1Match && h1Match[1].match(/^(?:Section:\s*)?(Multiple|True|Short|Essay|Multi)/i)) {
      finalizeQuestion();
      inCoverPage = false; // We're past the cover page
      
      const sectionTitle = h1Match[1];
      currentSection = {
        id: slugify(sectionTitle),
        title: sectionTitle,
        questionIds: [],
      };
      sections.push(currentSection);
      continue;
    }
    
    // Question header: ## 1. Question Title [2 pts] (traditional)
    // OR: 1. Question Title [2 pts] (clean syntax - no ## header)
    const h2Match = trimmed.match(/^##\s+(\d+)\.\s+(.+)$/);
    const cleanMatch = !h2Match ? trimmed.match(/^(\d+)\.\s+(.+)$/) : null;

    // Only treat as clean syntax question if it has a type marker, points, or we're past cover page
    // This prevents matching random numbered lists
    const isCleanQuestion = cleanMatch && (
      inCoverPage === false || // Already past cover page
      /\[(?:TF|MC|MA|Essay|Short|Match|FMB|Numeric|MultiAns|TrueFalse|True\/False|SelectAll|ShortAnswer|Matching|FillBlanks)/i.test(cleanMatch[2]) ||
      /\[\d+\s*pts?\]/i.test(cleanMatch[2]) ||
      /\(\d+\s*pts?\)/i.test(cleanMatch[2])
    );

    const questionMatch = h2Match || (isCleanQuestion ? cleanMatch : null);

    if (questionMatch) {
      if (inCoverPage) inCoverPage = false; // Auto-start questions if we hit a question header
      finalizeQuestion();

      const questionNum = parseInt(questionMatch[1], 10);
      let rawTitle = questionMatch[2];

      // Extract inline type markers [TF], [Essay], [MultiAns] first
      const { type: markerType, cleanTitle: titleAfterMarker } = extractTypeMarker(rawTitle);

      // Then extract points
      const { points, cleanTitle } = extractPoints(titleAfterMarker);

      // Determine type from marker, title content, or section
      const type = markerType || parseQuestionType(cleanTitle, currentSection?.title);

      // Strip arrow markers from title (e.g., "Statement → True" becomes "Statement")
      // Handle both → (unicode) and -> (ascii)
      let stemText = cleanTitle;
      const arrowMatch = cleanTitle.match(/\s*(?:→|->)\s*(True|False)\s*$/i);
      if (arrowMatch) {
        stemText = cleanTitle.replace(arrowMatch[0], '').trim();
        // Append hidden answer marker for finalizeQuestion to pick up
        stemText += ` -> ${arrowMatch[1]}`;
      }

      questionCounter++;
      currentQuestionLine = i + 1; // Store 1-indexed line number
      currentQuestion = {
        id: questionNum || questionCounter,
        type,
        stem: stemText,
        points: points || defaultPoints,
      };
      continue;
    }
    
    // Sub-part header: ### Part A: Title [3 pts] - treat as separate question
    const h3Match = trimmed.match(/^###\s+Part\s+([A-D]):\s+(.+)$/i);
    if (h3Match && currentQuestion) {
      // Add as sub-question (treat parent as essay with sub-parts)
      // For QTI, we'll include this as part of the parent question's stem
      const { points, cleanTitle } = extractPoints(h3Match[2]);
      currentQuestion.stem += `\n\n**Part ${h3Match[1].toUpperCase()}:** ${cleanTitle}`;
      if (points) {
        // Sub-part has its own points - this is informational
      }
      continue;
    }
    
    // Option lines (numbered or lettered, optionally with leading asterisk for correct marker)
    if (currentQuestion && trimmed.match(/^\*?(\d+|[a-e])\)\s+/i)) {
      currentQuestionLines.push(trimmed);
      continue;
    }
    
    // Standalone True/False options (*True, *False, True, False)
    if (currentQuestion && trimmed.match(/^\*?(True|False)$/i)) {
      currentQuestionLines.push(trimmed);
      continue;
    }
    
    // Dash list items as options (including matching pairs with ::)
    if (currentQuestion && trimmed.startsWith('-')) {
      currentQuestionLines.push(trimmed);
      continue;
    }

    // Blank answer definitions: [blank1]: answer1, answer2
    if (currentQuestion && trimmed.match(/^\[blank\d+\]:/i)) {
      currentQuestionLines.push(trimmed);
      continue;
    }
    
    // Question description/stem continuation (paragraph after ##)
    if (currentQuestion && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('[') && !trimmed.startsWith('>')) {
      // Skip LaTeX display math blocks
      if (trimmed.startsWith('$$') || trimmed.startsWith('\\[')) {
        // Include LaTeX in stem
        currentQuestion.stem += '\n\n' + trimmed;
      } else if (!trimmed.match(/^\d+\)\s/) && !trimmed.match(/^[a-e]\)/i)) {
        // Regular description text or image
        currentQuestion.stem += '\n\n' + trimmed;
      }
    }
    

  }
  
  // Finalize last question
  finalizeQuestion();
  
  return { title, defaultPoints, sections, questions };
}
