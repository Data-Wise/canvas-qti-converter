
import { describe, it, expect } from 'vitest';
import { generateItem, generateManifest21, generateTest } from '../src/generator/qti21';
import { generateQTI } from '../src/generator/qti';
import type { ParsedQuiz, Question } from '../src/parser/types';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

describe('QTI Generator', () => {
  const mockQuestion: Question = {
    id: 1,
    type: 'multiple_choice',
    stem: 'What is 1+1?',
    points: 1,
    options: [
      { id: 'a', text: '1', isCorrect: false },
      { id: 'b', text: '2', isCorrect: true }
    ],
    section: undefined
  };

  const mockQuiz: ParsedQuiz = {
    title: 'Test Quiz',
    defaultPoints: 1,
    sections: [],
    questions: [mockQuestion]
  };

  describe('generateItem', () => {
    it('should generate valid assessmentItem XML', () => {
      const xml = generateItem(mockQuestion, 'Quiz');
      expect(xml).toContain('identifier="item_1"');
      expect(xml).toContain('What is 1+1?');
      expect(xml).toContain('<value>B</value>'); // Correct answer

      // Validate XML structure
      const obj = parser.parse(xml);
      expect(obj.assessmentItem).toBeDefined();
      expect(obj.assessmentItem['@_identifier']).toBe('item_1');
    });

    it('should escape special characters', () => {
      const q = { ...mockQuestion, stem: 'A & B < C' };
      const xml = generateItem(q, 'Quiz');
      expect(xml).toContain('A &amp; B &lt; C');
    });
  });

  describe('generateManifest', () => {
    it('should generate valid imsmanifest.xml', () => {
      const xml = generateManifest21(mockQuiz);
      expect(xml).toContain('identifier="res_item_1"');
      expect(xml).toContain('type="imsqti_item_xmlv2p1"');

      // Validate XML structure
      const obj = parser.parse(xml);
      expect(obj.manifest).toBeDefined();
      expect(obj.manifest.resources.resource).toBeDefined();
    });
  });
});

describe('QTI 1.2 Generator (Canvas)', () => {
  it('should generate matching question XML', () => {
    const quiz: ParsedQuiz = {
      title: 'Test',
      defaultPoints: 1,
      sections: [],
      questions: [{
        id: 1,
        type: 'matching',
        stem: 'Match the terms',
        points: 2,
        options: [],
        matchPairs: [
          { left: 'Mean', right: 'Σx/n' },
          { left: 'Variance', right: 'Σ(x-μ)²/n' }
        ]
      }]
    };

    const { qti } = generateQTI(quiz);

    expect(qti).toContain('matching_question');
    expect(qti).toContain('Mean');
    expect(qti).toContain('Σx/n');
    expect(qti).toContain('Variance');
    expect(qti).toContain('response_lid'); // Matching uses response_lid
  });

  it('should generate fill-in-multiple-blanks question XML', () => {
    const quiz: ParsedQuiz = {
      title: 'Test',
      defaultPoints: 1,
      sections: [],
      questions: [{
        id: 1,
        type: 'fill_in_multiple_blanks',
        stem: 'r ranges from [blank1] to [blank2]',
        points: 2,
        options: [],
        blanks: [
          { blankId: 'blank1', answers: ['-1'] },
          { blankId: 'blank2', answers: ['1', '+1'] }
        ]
      }]
    };

    const { qti } = generateQTI(quiz);

    expect(qti).toContain('fill_in_multiple_blanks_question');
    expect(qti).toContain('response_str'); // FMB uses response_str
    expect(qti).toContain('-1');
  });

  it('should generate feedback XML when present', () => {
    const quiz: ParsedQuiz = {
      title: 'Test',
      defaultPoints: 1,
      sections: [],
      questions: [{
        id: 1,
        type: 'multiple_choice',
        stem: 'Test question',
        points: 1,
        options: [
          { id: 'a', text: 'Wrong', isCorrect: false, feedback: 'Try again!' },
          { id: 'b', text: 'Right', isCorrect: true, feedback: 'Correct!' }
        ],
        generalFeedback: 'Review chapter 5.'
      }]
    };

    const { qti } = generateQTI(quiz);

    expect(qti).toContain('itemfeedback');
    expect(qti).toContain('Try again!');
    expect(qti).toContain('Correct!');
    expect(qti).toContain('Review chapter 5.');
  });
});
