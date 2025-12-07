#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, basename, dirname, resolve, extname } from 'path';
import { parseMarkdown } from './parser/markdown.js';
import { generateQTI, ImageResolver } from './generator/qti.js';
import { QtiValidator } from './diagnostic/validator.js';
import { lintMarkdown } from './diagnostic/linter.js';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('qti-convert')
  .description('Convert Markdown/Text questions to Canvas QTI 1.2 format')
  .version('0.3.0');

program
  .command('verify')
  .description('Verify a QTI package')
  .argument('<path>', 'Path to QTI zip or directory')
  .action(async (path: string) => {
    console.log(`Verifying package: ${path}...`);
    const validator = new QtiValidator();
    const report = await validator.validatePackage(path);
    
    if (report.isValid) {
      console.log('✓ Validation PASSED');
      console.log(`  • Items: ${report.details.itemCount}`);
      console.log(`  • Resources: ${report.details.resourceCount}`);
      if (report.details.testFound) console.log('  • Test/Assessment: Found');
      
      if (report.warnings.length > 0) {
        console.log('\nWarnings:');
        report.warnings.forEach(w => console.warn(`  ! ${w}`));
      }
    } else {
      console.error('✗ Validation FAILED');
      report.errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }
  });

program
  .command('emulate-canvas')
  .description('Simulate Canvas LMS import and predict success/failure')
  .argument('<path>', 'Path to QTI zip or directory')
  .action(async (path: string) => {
    console.log(`\n🎓 Canvas Import Emulator\n`);
    console.log(`Analyzing: ${path}\n`);
    
    const validator = new QtiValidator();
    const report = await validator.validatePackage(path);
    
    // Canvas-specific analysis
    const canvasErrors = report.errors.filter(e => 
      e.includes('No correct answer') || 
      e.includes('Unsupported Canvas') ||
      e.includes('Missing image') ||
      e.includes('Mismatch: Cardinality')
    );
    
    const canvasWarnings = report.warnings.filter(w =>
      w.includes('responseProcessing') ||
      w.includes('limited Canvas support')
    );
    
    console.log(`📊 Analysis Results:`);
    console.log(`   Items scanned: ${report.details.itemCount}`);
    console.log(`   Resources: ${report.details.resourceCount}`);
    console.log(`   Has test structure: ${report.details.testFound ? 'Yes' : 'No'}`);
    
    if (canvasErrors.length === 0 && report.errors.length === 0) {
      console.log(`\n✅ PREDICTION: Canvas import will likely SUCCEED`);
      
      if (canvasWarnings.length > 0) {
        console.log(`\n⚠️  Warnings (may need attention):`);
        canvasWarnings.forEach(w => console.log(`   • ${w}`));
      }
    } else {
      console.log(`\n❌ PREDICTION: Canvas import will likely FAIL`);
      
      console.log(`\n🔴 Canvas Import Blockers:`);
      canvasErrors.forEach(e => console.log(`   • ${e}`));
      
      // Provide actionable fixes
      console.log(`\n🔧 Suggested Fixes:`);
      
      if (canvasErrors.some(e => e.includes('No correct answer'))) {
        console.log(`   → Mark correct answers with [correct], ✓, or **bold**`);
      }
      if (canvasErrors.some(e => e.includes('Unsupported Canvas'))) {
        console.log(`   → Use choiceInteraction (MC/TF) or textEntryInteraction (short answer)`);
      }
      if (canvasErrors.some(e => e.includes('Missing image'))) {
        console.log(`   → Ensure all image files are bundled in the items/ folder`);
        console.log(`   → For R/Python figures, verify they are generated before conversion`);
      }
      if (canvasErrors.some(e => e.includes('Mismatch: Cardinality'))) {
        console.log(`   → Fix cardinality/maxChoices mismatch in response declarations`);
      }
      
      if (report.errors.length > canvasErrors.length) {
        console.log(`\n🔴 Other Errors:`);
        report.errors.filter(e => !canvasErrors.includes(e))
          .forEach(e => console.log(`   • ${e}`));
      }
      
      process.exit(1);
    }
  });

program
  .command('check')
  .alias('lint')
  .description('Lint a Markdown/Text file for syntax errors')
  .argument('<input>', 'Input file')
  .action((input: string) => {
    console.log(`Checking file: ${input}...`);
    
    try {
      const content = readFileSync(input, 'utf-8');
      const errors = lintMarkdown(content);
      
      if (errors.length === 0) {
        console.log('✓ No issues found. Ready for conversion.');
      } else {
        const errorCount = errors.filter(e => e.severity === 'error').length;
        const warningCount = errors.filter(e => e.severity === 'warning').length;
        
        console.log(`Found ${errorCount} errors and ${warningCount} warnings:\n`);
        
        errors.forEach(e => {
          const icon = e.severity === 'error' ? '✗' : '!';
          const colorFn = e.severity === 'error' ? console.error : console.warn;
          const loc = e.line ? `Line ${e.line}: ` : '';
          
          colorFn(`${icon} ${loc}${e.message}`);
          if (e.context) colorFn(`  Context: ${e.context}`);
        });
        
        if (errorCount > 0) process.exit(1);
      }
    } catch (error) {
       console.error(`Error reading file: ${error instanceof Error ? error.message : error}`);
       process.exit(1);
    }
  });

// Default command (convert)
program
  .argument('[input]', 'Input file (markdown or text)')
  .option('-o, --output <file>', 'Output QTI zip file')
  .option('-v, --validate', 'Validate output structure')
  .option('--preview', 'Preview parsed questions without generating file')
  .action(async (input: string, options: { output?: string; validate?: boolean; preview?: boolean }) => {
    if (!input) {
      program.help();
      return;
    }
    // Main conversion logic
    try {
      const content = readFileSync(input, 'utf-8');
      const parsed = parseMarkdown(content);
      
      if (options.preview) {
        console.log('Parsed Questions:');
        console.log(JSON.stringify(parsed, null, 2));
        return;
      }

      // Create QTI 1.2 package (Canvas Classic Quizzes format)
      const tempDir = mkdtempSync(join(tmpdir(), 'qti12-'));
      const inputDir = dirname(resolve(input));
      
      // Create image resolver that reads local files and converts to base64 data URIs
      const imageResolver: ImageResolver = (imagePath: string) => {
        try {
          // Resolve path relative to input file
          const fullPath = join(inputDir, imagePath);
          if (!existsSync(fullPath)) {
            console.warn(`Warning: Image not found: ${fullPath}`);
            return null;
          }
          
          // Read file and convert to base64
          const imageData = readFileSync(fullPath);
          const base64Data = imageData.toString('base64');
          
          // Determine MIME type from extension
          const ext = extname(imagePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp'
          };
          const mimeType = mimeTypes[ext] || 'application/octet-stream';
          
          return `data:${mimeType};base64,${base64Data}`;
        } catch (error) {
          console.warn(`Warning: Failed to read image ${imagePath}:`, error);
          return null;
        }
      };
      
      try {
        // Generate QTI 1.2 XML with embedded images
        const { qti, assessmentIdent } = generateQTI(parsed, imageResolver);
        
        // Write the QTI XML file
        const qtiFilename = `${parsed.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.xml`;
        writeFileSync(join(tempDir, qtiFilename), qti);
        
        // Create zip file
        const outputZip = options.output || input.replace(/\.(md|txt)$/, '.qti.zip');
        
        // Use zip command to create package
        execSync(`cd "${tempDir}" && zip -r "${process.cwd()}/${outputZip}" .`, { stdio: 'pipe' });
        
        console.log(`✓ Generated QTI 1.2 Package: ${outputZip}`);
        console.log(`  • ${parsed.questions.length} questions`);
        console.log(`  • ${parsed.sections.length} sections`);
        console.log(`  • Format: Canvas Classic Quizzes compatible`);
        
      } finally {
        // Clean up temp directory
        rmSync(tempDir, { recursive: true, force: true });
      }
      
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
