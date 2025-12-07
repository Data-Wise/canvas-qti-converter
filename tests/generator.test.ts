
import { describe, it, expect } from 'vitest';
import { generateItem, generateManifest21, generateTest } from '../src/generator/qti21';
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
