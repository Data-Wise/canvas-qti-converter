import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadConfig } from '../src/config';

describe('Config Loading', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a unique test directory
    testDir = join(tmpdir(), `examify-config-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should return empty config when no config file exists', () => {
    const inputPath = join(testDir, 'test.md');
    writeFileSync(inputPath, '# Test');

    const config = loadConfig(inputPath);
    expect(config).toEqual({});
  });

  it('should load .examifyrc.json from input directory', () => {
    const configPath = join(testDir, '.examifyrc.json');
    const inputPath = join(testDir, 'test.md');

    writeFileSync(configPath, JSON.stringify({
      defaultPoints: 5,
      validate: true
    }));
    writeFileSync(inputPath, '# Test');

    const config = loadConfig(inputPath);
    expect(config.defaultPoints).toBe(5);
    expect(config.validate).toBe(true);
  });

  it('should load examify.config.json as alternative', () => {
    const configPath = join(testDir, 'examify.config.json');
    const inputPath = join(testDir, 'test.md');

    writeFileSync(configPath, JSON.stringify({
      title: 'My Quiz',
      outputDir: './output'
    }));
    writeFileSync(inputPath, '# Test');

    const config = loadConfig(inputPath);
    expect(config.title).toBe('My Quiz');
    expect(config.outputDir).toBe('./output');
  });

  it('should prefer .examifyrc.json over examify.config.json', () => {
    const rcPath = join(testDir, '.examifyrc.json');
    const configPath = join(testDir, 'examify.config.json');
    const inputPath = join(testDir, 'test.md');

    writeFileSync(rcPath, JSON.stringify({ defaultPoints: 10 }));
    writeFileSync(configPath, JSON.stringify({ defaultPoints: 20 }));
    writeFileSync(inputPath, '# Test');

    const config = loadConfig(inputPath);
    expect(config.defaultPoints).toBe(10);
  });

  it('should search parent directories for config', () => {
    const subDir = join(testDir, 'subdir');
    mkdirSync(subDir);

    const configPath = join(testDir, '.examifyrc.json');
    const inputPath = join(subDir, 'test.md');

    writeFileSync(configPath, JSON.stringify({ defaultPoints: 3 }));
    writeFileSync(inputPath, '# Test');

    const config = loadConfig(inputPath);
    expect(config.defaultPoints).toBe(3);
  });

  it('should validate config values', () => {
    const configPath = join(testDir, '.examifyrc.json');
    const inputPath = join(testDir, 'test.md');

    writeFileSync(configPath, JSON.stringify({
      defaultPoints: -5,  // Invalid: should be ignored
      title: '',          // Invalid: empty string
      validate: 'yes',    // Invalid: not boolean
      outputDir: './out'  // Valid
    }));
    writeFileSync(inputPath, '# Test');

    const config = loadConfig(inputPath);
    expect(config.defaultPoints).toBeUndefined();
    expect(config.title).toBeUndefined();
    expect(config.validate).toBeUndefined();
    expect(config.outputDir).toBe('./out');
  });

  it('should handle malformed JSON gracefully', () => {
    const configPath = join(testDir, '.examifyrc.json');
    const inputPath = join(testDir, 'test.md');

    writeFileSync(configPath, '{ invalid json }');
    writeFileSync(inputPath, '# Test');

    // Should not throw, just return empty config
    const config = loadConfig(inputPath);
    expect(config).toEqual({});
  });

  it('should work without inputPath (use cwd)', () => {
    // This test just ensures no crash when inputPath is undefined
    const config = loadConfig();
    expect(config).toBeDefined();
  });
});
