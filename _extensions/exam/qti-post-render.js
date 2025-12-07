#!/usr/bin/env node
/**
 * Quarto Exam Post-Render Script
 * Converts rendered Markdown to QTI format using the qti-convert CLI
 * 
 * Usage: Called automatically by Quarto post-render when output: qti is set
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, basename, join } from 'path';

const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Usage: qti-post-render <input.md>');
  process.exit(1);
}

if (!existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

const dir = dirname(inputFile);
const base = basename(inputFile, '.md');
const outputFile = join(dir, `${base}.qti.zip`);

// Check for opt-in flag in frontmatter
const content = readFileSync(inputFile, 'utf8');
const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

// Default to FALSE. Only run if explicitly enabled.
let shouldRun = false;

if (yamlMatch) {
  const yaml = yamlMatch[1];
  // Simple regex check for "qti-export: true" or "qti: true"
  if (yaml.match(/qti-export:\s*true/) || yaml.match(/qti:\s*true/)) {
    shouldRun = true;
  }
}

if (!shouldRun) {
  console.log('ℹ️ QTI generation skipped. Add `qti-export: true` to YAML to enable.');
  process.exit(0);
}

try {
  // Use the qti-convert CLI from this package
  // The script is in _extensions/exam/qti-post-render.js
  // The CLI is in dist/index.js
  // So we need to go up two levels: ../../dist/index.js
  const scriptDir = dirname(import.meta.url.replace('file://', ''));
  const cliPath = join(scriptDir, '..', '..', 'dist', 'index.js');
  
  if (!existsSync(cliPath)) {
    throw new Error(`CLI not found at ${cliPath}`);
  }

  execSync(`node "${cliPath}" "${inputFile}" -o "${outputFile}"`, {
    stdio: 'inherit',
    cwd: dir
  });
  
  console.log(`✓ QTI package generated: ${outputFile}`);
} catch (error) {
  console.error('Error generating QTI:', error.message);
  process.exit(1);
}
