import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { parseMarkdown } from '../src/parser/markdown';

describe('Template Tests', () => {
  const examplesDir = join(__dirname, '..', 'examples');
  const scratchDir = join(__dirname, '..', 'scratch');

  // Test starter-exam-md.md template
  describe('starter-exam-md.md', () => {
    const templatePath = join(examplesDir, 'starter-exam-md.md');

    it('should exist as a template file', () => {
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should parse all question types correctly', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      expect(result.title).toBe('My First Exam');
      expect(result.questions.length).toBeGreaterThanOrEqual(6);

      // Check question types are detected
      const types = result.questions.map(q => q.type);
      expect(types).toContain('multiple_choice');
      expect(types).toContain('true_false');
      expect(types).toContain('multiple_answers');
      expect(types).toContain('short_answer');
      expect(types).toContain('essay');
    });

    it('should have correct answers marked in all MC questions', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      const mcQuestions = result.questions.filter(q => q.type === 'multiple_choice');
      
      for (const q of mcQuestions) {
        const correctAnswers = q.options.filter(o => o.isCorrect);
        expect(correctAnswers.length).toBeGreaterThan(0);
      }
    });

    it('should convert to QTI successfully', () => {
      const outputPath = join(scratchDir, 'starter-exam-md.qti.zip');
      
      // Clean up
      if (existsSync(outputPath)) rmSync(outputPath);
      if (!existsSync(scratchDir)) mkdirSync(scratchDir, { recursive: true });

      // Run conversion
      const result = execSync(
        `node dist/index.js "${templatePath}" -o "${outputPath}"`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      expect(existsSync(outputPath)).toBe(true);
      expect(result).toContain('Generated QTI');
    });
  });

  // Test canvas-ready.md template
  describe('canvas-ready.md', () => {
    const templatePath = join(examplesDir, 'canvas-ready.md');

    it('should exist as a template file', () => {
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should parse comprehensive question set', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      expect(result.title).toBe('Canvas Quiz - Statistics 101');
      expect(result.questions.length).toBeGreaterThanOrEqual(15);

      // Check all types present
      const types = new Set(result.questions.map(q => q.type));
      expect(types.has('multiple_choice')).toBe(true);
      expect(types.has('true_false')).toBe(true);
      expect(types.has('multiple_answers')).toBe(true);
      expect(types.has('short_answer')).toBe(true);
      expect(types.has('essay')).toBe(true);
    });

    it('should handle LaTeX math in questions', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      // Find math questions
      const mathQuestions = result.questions.filter(q => 
        q.stem.includes('$') || q.stem.includes('\\frac')
      );
      
      expect(mathQuestions.length).toBeGreaterThan(0);
    });

    it('should handle code blocks in questions', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      // Find code questions
      const codeQuestions = result.questions.filter(q => 
        q.stem.includes('```')
      );
      
      expect(codeQuestions.length).toBeGreaterThan(0);
    });

    it('should detect image references', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      // Find questions with images
      const imageQuestions = result.questions.filter(q => 
        q.images && q.images.length > 0
      );
      
      expect(imageQuestions.length).toBeGreaterThan(0);
    });

    it('should convert to QTI successfully', () => {
      const outputPath = join(scratchDir, 'canvas-ready.qti.zip');
      
      // Clean up
      if (existsSync(outputPath)) rmSync(outputPath);
      if (!existsSync(scratchDir)) mkdirSync(scratchDir, { recursive: true });

      // Run conversion
      const result = execSync(
        `node dist/index.js "${templatePath}" -o "${outputPath}"`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      expect(existsSync(outputPath)).toBe(true);
      expect(result).toContain('Generated QTI');
    });
  });

  // Test canvas-validation.md (comprehensive feature test)
  describe('canvas-validation.md', () => {
    const templatePath = join(examplesDir, 'canvas-validation.md');

    it('should exist as a template file', () => {
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should parse with all feature types', () => {
      const content = readFileSync(templatePath, 'utf-8');
      const result = parseMarkdown(content);

      expect(result.questions.length).toBeGreaterThanOrEqual(8);

      // Should have images
      const hasImages = result.questions.some(q => q.images && q.images.length > 0);
      expect(hasImages).toBe(true);
    });

    it('should convert to QTI with image bundling', () => {
      const outputPath = join(scratchDir, 'canvas-validation.qti.zip');
      
      if (existsSync(outputPath)) rmSync(outputPath);
      if (!existsSync(scratchDir)) mkdirSync(scratchDir, { recursive: true });

      const result = execSync(
        `node dist/index.js "${templatePath}" -o "${outputPath}"`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      expect(existsSync(outputPath)).toBe(true);
      expect(result).toContain('images bundled');
    });
  });
});
