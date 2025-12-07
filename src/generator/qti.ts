/**
 * QTI XML Generator for Canvas
 * Generates QTI 1.2 format compatible with Canvas LMS import
 */

import type { ParsedQuiz, Question, AnswerOption } from '../parser/types.js';
import { slugify } from '../parser/types.js';
import { createHash } from 'crypto';

/**
 * Generate a Canvas-style identifier (64-char hex hash)
 */
export function generateCanvasId(seed: string): string {
  return createHash('sha256').update(seed + Date.now() + Math.random()).digest('hex');
}

/**
 * Optional image resolver function type
 * Takes an image path and returns a data URI or null if not resolvable
 */
export type ImageResolver = (imagePath: string) => string | null;

/**
 * Escape XML special characters while converting LaTeX delimiters for Canvas
 * Canvas expects \(...\) for inline and \[...\] for display math
 * Also converts markdown images to HTML img tags with optional base64 embedding
 */
function escapeXmlPreserveLaTeX(text: string, imageResolver?: ImageResolver): string {
  // First, extract and preserve markdown images as placeholders
  const images: string[] = [];
  let result = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const placeholder = `__IMG_PLACEHOLDER_${images.length}__`;
    // If we have an image resolver, try to get a data URI
    let imgSrc = src;
    if (imageResolver) {
      const resolved = imageResolver(src);
      if (resolved) {
        imgSrc = resolved;
      }
    }
    images.push(`<img src="${imgSrc}" alt="${alt}"/>`);
    return placeholder;
  });
  
  // Convert LaTeX delimiters from Quarto/Pandoc format to Canvas format
  result = result
    // Convert display math: $$...$$ → \[...\]
    .replace(/\$\$([\s\S]*?)\$\$/g, '\\[$1\\]')
    // Convert inline math: $...$ → \(...\) (careful not to match \$)
    .replace(/(?<!\\)\$([^\$\n]+?)\$/g, '\\($1\\)');
  
  // Escape XML special characters
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  // Restore image tags (they're already properly formatted HTML)
  images.forEach((img, i) => {
    result = result.replace(`__IMG_PLACEHOLDER_${i}__`, img);
  });
  
  return result;
}

/**
 * Map internal question type to Canvas QTI type
 */
function getCanvasQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'multiple_choice': 'multiple_choice_question',
    'multiple_answers': 'multiple_answers_question',
    'true_false': 'true_false_question',
    'essay': 'essay_question',
    'short_answer': 'short_answer_question',
    'fill_in_blank': 'fill_in_blank_question',
    'fill_in_multiple_blanks': 'fill_in_multiple_blanks_question',
    'matching': 'matching_question',
    'numerical': 'numerical_question',
    'calculated': 'calculated_question',
  };
  return typeMap[type] || 'multiple_choice_question';
}

/**
 * Generate answer options with Canvas-style identifiers
 */
interface GeneratedOption {
  ident: string;
  option: AnswerOption;
}

function generateOptionsWithIds(options: AnswerOption[], questionSeed: string): GeneratedOption[] {
  return options.map((opt, index) => ({
    ident: generateCanvasId(`${questionSeed}_opt_${index}_${opt.text}`),
    option: opt,
  }));
}

/**
 * Generate answer options XML
 */
function generateOptionsXml(generatedOptions: GeneratedOption[]): string {
  return generatedOptions.map(({ ident, option }) => 
    `<response_label ident="${ident}">` +
    `<material>` +
    `<mattext texttype="text/html">${escapeXmlPreserveLaTeX(option.text)}</mattext>` +
    `</material>` +
    `</response_label>`
  ).join('');
}

/**
 * Generate response processing XML for correct answer
 * Canvas uses score of 100 for correct answers (percentage-based)
 */
function generateResprocessing(question: Question, generatedOptions: GeneratedOption[]): string {
  if (question.type === 'essay' || question.type === 'short_answer' || question.type === 'numerical') {
    return `<resprocessing>` +
      `<outcomes>` +
      `<decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>` +
      `</outcomes>` +
      `</resprocessing>`;
  }

  const correctOptions = generatedOptions.filter(go => go.option.isCorrect);
  if (correctOptions.length === 0) return '';

  // For multiple_answers questions, use "and" logic for all correct answers
  if (question.type === 'multiple_answers' && correctOptions.length > 1) {
    const varequals = correctOptions.map(co => 
      `<varequal respident="response1">${co.ident}</varequal>`
    ).join('');
    
    return `<resprocessing>` +
      `<outcomes>` +
      `<decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>` +
      `</outcomes>` +
      `<respcondition continue="No">` +
      `<conditionvar>` +
      `<and>${varequals}</and>` +
      `</conditionvar>` +
      `<setvar actoin="Set" varname="SCORE">100</setvar>` +
      `</respcondition>` +
      `</resprocessing>`;
  }

  // Single correct answer (standard multiple choice, true/false)
  const correctOption = correctOptions[0];
  
  // Canvas uses "actoin" (typo) - we match this for compatibility
  return `<resprocessing>` +
    `<outcomes>` +
    `<decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>` +
    `</outcomes>` +
    `<respcondition continue="No">` +
    `<conditionvar>` +
    `<varequal respident="response1">${correctOption.ident}</varequal>` +
    `</conditionvar>` +
    `<setvar actoin="Set" varname="SCORE">100</setvar>` +
    `</respcondition>` +
    `</resprocessing>`;
}

/**
 * Generate question metadata including Canvas-specific fields
 */
function generateItemMetadata(
  question: Question, 
  qType: string, 
  generatedOptions: GeneratedOption[],
  questionRef: string
): string {
  const originalAnswerIds = generatedOptions.map(go => go.ident).join(',');
  
  let metadata = `<itemmetadata>` +
    `<qtimetadata>` +
    `<qtimetadatafield>` +
    `<fieldlabel>question_type</fieldlabel>` +
    `<fieldentry>${qType}</fieldentry>` +
    `</qtimetadatafield>` +
    `<qtimetadatafield>` +
    `<fieldlabel>points_possible</fieldlabel>` +
    `<fieldentry>${question.points}</fieldentry>` +
    `</qtimetadatafield>`;
  
  // Add original_answer_ids for questions with options
  if (generatedOptions.length > 0) {
    metadata += `<qtimetadatafield>` +
      `<fieldlabel>original_answer_ids</fieldlabel>` +
      `<fieldentry>${originalAnswerIds}</fieldentry>` +
      `</qtimetadatafield>`;
  }
  
  // Add assessment question reference
  metadata += `<qtimetadatafield>` +
    `<fieldlabel>assessment_question_identifierref</fieldlabel>` +
    `<fieldentry>${questionRef}</fieldentry>` +
    `</qtimetadatafield>`;
  
  metadata += `</qtimetadata></itemmetadata>`;
  
  return metadata;
}

/**
 * Generate a single question item XML
 */
function generateQuestionXml(question: Question, imageResolver?: ImageResolver): string {
  const qType = getCanvasQuestionType(question.type);
  const questionSeed = `q_${question.id}_${question.stem.substring(0, 50)}`;
  const itemIdent = generateCanvasId(questionSeed);
  const questionRef = generateCanvasId(`ref_${questionSeed}`);
  
  // Generate options with Canvas-style identifiers
  const generatedOptions = generateOptionsWithIds(question.options, questionSeed);
  
  let presentationContent: string;
  
  if (question.type === 'essay' || question.type === 'short_answer') {
    presentationContent = `<material>` +
      `<mattext texttype="text/html">${escapeXmlPreserveLaTeX(question.stem, imageResolver)}</mattext>` +
      `</material>` +
      `<response_str ident="response1" rcardinality="Single">` +
      `<render_fib>` +
      `<response_label ident="answer1"/>` +
      `</render_fib>` +
      `</response_str>`;
  } else {
    presentationContent = `<material>` +
      `<mattext texttype="text/html">${escapeXmlPreserveLaTeX(question.stem, imageResolver)}</mattext>` +
      `</material>` +
      `<response_lid ident="response1" rcardinality="Single">` +
      `<render_choice>` +
      `${generateOptionsXml(generatedOptions)}` +
      `</render_choice>` +
      `</response_lid>`;
  }
  
  return `<item ident="${itemIdent}" title="Question">` +
    `${generateItemMetadata(question, qType, generatedOptions, questionRef)}` +
    `<presentation>${presentationContent}</presentation>` +
    `${generateResprocessing(question, generatedOptions)}` +
    `</item>`;
}

/**
 * Generate complete QTI XML from parsed quiz
 * Output is compact (single line) to match Canvas export format
 * Returns both the QTI XML and the assessment identifier for manifest linking
 */
export function generateQTI(quiz: ParsedQuiz, imageResolver?: ImageResolver): { qti: string; assessmentIdent: string } {
  const assessmentIdent = generateCanvasId(`assessment_${quiz.title}`);
  
  // Generate all questions - include every question regardless of section assignment
  // Canvas puts all questions in a single root_section anyway
  const allQuestionsXml = quiz.questions.map(q => generateQuestionXml(q, imageResolver)).join('');

  // Build the complete QTI document (compact format like Canvas)
  const qti = `<?xml version="1.0" encoding="UTF-8"?>` +
    `<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" ` +
    `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xsi:schemaLocation="http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd">` +
    `<assessment ident="${assessmentIdent}" title="${escapeXmlPreserveLaTeX(quiz.title)}">` +
    `<qtimetadata>` +
    `<qtimetadatafield>` +
    `<fieldlabel>cc_maxattempts</fieldlabel>` +
    `<fieldentry>1</fieldentry>` +
    `</qtimetadatafield>` +
    `</qtimetadata>` +
    `<section ident="root_section">` +
    `${allQuestionsXml}` +
    `</section>` +
    `</assessment>` +
    `</questestinterop>`;
    
  return { qti, assessmentIdent };
}
