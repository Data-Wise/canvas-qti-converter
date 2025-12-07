/**
 * Markdown parser for quiz questions
 * Supports both original format AND Quarto GFM output
 */

import type { ParsedQuiz, Question, Section, AnswerOption, QuestionType } from './types.js';
import { slugify } from './types.js';

/**
 * Parse question type from title or section context
 */
function parseQuestionType(text: string, sectionTitle?: string): QuestionType {
  const lower = text.toLowerCase();
  
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
 * Parse answer options from lines following a question
 * Handles multiple formats:
 * - 1) Answer, 2) Answer (Quarto GFM numbered)
 * - a) Answer, b) Answer (lettered)
 * - **Bold answer** for correct
 */
function parseOptions(lines: string[]): AnswerOption[] {
  const options: AnswerOption[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match numbered options: 1) Answer, 2) Answer
    const numMatch = trimmed.match(/^(\d+)\)\s+(.+)$/);
    if (numMatch) {
      const text = numMatch[2];
      // Check for correctness markers: **, ✓, or checkmark
      const isCorrect = text.includes('**') || text.includes('✓') || text.includes('✔');
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/[✓✔]/g, '')
        .trim();
      options.push({
        id: String.fromCharCode(96 + parseInt(numMatch[1])), // 1->a, 2->b, etc.
        text: cleanText,
        isCorrect
      });
      continue;
    }
    
    // Match lettered options: a) Answer, b) Answer
    const letterMatch = trimmed.match(/^([a-e])\)\s+(.+)$/i);
    if (letterMatch) {
      const text = letterMatch[2];
      // Check for correctness markers: **, *, ✓
      const isCorrect = text.includes('**') || text.startsWith('*') || text.includes('✓') || text.includes('✔');
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/^\*/, '')
        .replace(/[✓✔]/g, '')
        .trim();
      options.push({
        id: letterMatch[1].toLowerCase(),
        text: cleanText,
        isCorrect
      });
      continue;
    }
    
    // Match dash options: - Answer or -  **Answer** (correct)
    const dashMatch = trimmed.match(/^-\s+(.+)$/);
    if (dashMatch) {
      const text = dashMatch[1];
      const isCorrect = text.includes('**');
      const cleanText = text.replace(/\*\*/g, '').trim();
      options.push({
        id: String.fromCharCode(97 + options.length), // a, b, c, ...
        text: cleanText,
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
  let questionCounter = 0;
  let inCoverPage = true; // Skip cover page content
  let inSolutionBlock = false; // Track when inside <div class="solution">...</div>
  
  const finalizeQuestion = () => {
    if (!currentQuestion || !currentQuestion.stem) {
      currentQuestion = null;
      currentQuestionLines = [];
      return;
    }
    
    const options = parseOptions(currentQuestionLines);
    let type = currentQuestion.type || 'multiple_choice';
    
    // Auto-detect question type from options
    if (options.length > 0 && isTrueFalseQuestion(options)) {
      type = 'true_false';
    }

    // parse answer from stem if provided (e.g. -> True)
    if (type === 'true_false' && options.length === 0) {
      // Check for answer pattern in stem
      const answerMatch = currentQuestion.stem?.match(/(?:->|Answer:|Ans:)\s*(True|False)/i);
      const correctAnswer = answerMatch ? answerMatch[1].toLowerCase() : null;
      
      // Auto-generate options
      options.push({ id: 'a', text: 'True', isCorrect: correctAnswer === 'true' });
      options.push({ id: 'b', text: 'False', isCorrect: correctAnswer === 'false' });
      
      // Clean stem of the answer key if found
      if (answerMatch && currentQuestion.stem) {
        currentQuestion.stem = currentQuestion.stem.replace(answerMatch[0], '').trim();
      }
    } else if (options.length === 0) {
       // No options = probably essay or short answer
       if (type === 'multiple_choice') {
         type = 'short_answer';
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
    
    // Skip callout blocks, solution blocks, and other metadata (checked early to exclude from stem)
    if (trimmed.startsWith('>') || trimmed.startsWith(':::') || trimmed.includes('class=')) {
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
    
    // Question header: ## 1. Question Title [2 pts]
    const h2Match = trimmed.match(/^##\s+(\d+)\.\s+(.+)$/);
    if (h2Match) {
      if (inCoverPage) inCoverPage = false; // Auto-start questions if we hit a question header
      finalizeQuestion();
      
      const questionNum = parseInt(h2Match[1], 10);
      const { points, cleanTitle } = extractPoints(h2Match[2]);
      const type = parseQuestionType(cleanTitle, currentSection?.title);
      
      // Strip arrow markers from title (e.g., "Statement → True" becomes "Statement")
      // But preserve the answer for T/F auto-generation
      let stemText = cleanTitle;
      const arrowMatch = cleanTitle.match(/\s*[→\->]\s*(True|False)\s*$/i);
      if (arrowMatch) {
        stemText = cleanTitle.replace(arrowMatch[0], '').trim();
        // Append hidden answer marker for finalizeQuestion to pick up
        stemText += ` -> ${arrowMatch[1]}`;
      }
      
      questionCounter++;
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
    
    // Option lines (numbered or lettered)
    if (currentQuestion && trimmed.match(/^(\d+|[a-e])\)\s+/i)) {
      currentQuestionLines.push(trimmed);
      continue;
    }
    
    // Dash list items as options
    if (currentQuestion && trimmed.startsWith('-')) {
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
        // Regular description text
        if (!currentQuestion.stem!.includes('\n')) {
          currentQuestion.stem += '\n\n' + trimmed;
        }
      }
    }
    

  }
  
  // Finalize last question
  finalizeQuestion();
  
  return { title, defaultPoints, sections, questions };
}
