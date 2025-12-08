/**
 * Configuration file support for Examify
 * Loads settings from .examifyrc.json or examify.config.json
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Configuration options for Examify
 */
export interface ExamifyConfig {
  /** Default points per question (default: 1) */
  defaultPoints?: number;
  /** Default output directory for QTI files */
  outputDir?: string;
  /** Always validate output after conversion */
  validate?: boolean;
  /** Quiz title override */
  title?: string;
}

/** Config file names to search for (in priority order) */
const CONFIG_FILES = [
  '.examifyrc.json',
  'examify.config.json',
];

/**
 * Find and load config file, searching from inputPath up to root
 * @param inputPath - Path to input file (search starts from its directory)
 * @returns Loaded config or empty object if not found
 */
export function loadConfig(inputPath?: string): ExamifyConfig {
  const startDir = inputPath ? dirname(inputPath) : process.cwd();
  const configPath = findConfigFile(startDir);

  if (!configPath) {
    return {};
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content) as ExamifyConfig;
    return validateConfig(config);
  } catch (error) {
    console.warn(`Warning: Failed to load config from ${configPath}: ${error instanceof Error ? error.message : error}`);
    return {};
  }
}

/**
 * Search for config file from startDir up to filesystem root
 */
function findConfigFile(startDir: string): string | null {
  let currentDir = startDir;

  // Limit search depth to prevent infinite loops
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    for (const configFile of CONFIG_FILES) {
      const configPath = join(currentDir, configFile);
      if (existsSync(configPath)) {
        return configPath;
      }
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached filesystem root
      break;
    }
    currentDir = parentDir;
    depth++;
  }

  return null;
}

/**
 * Validate and sanitize config values
 */
function validateConfig(config: ExamifyConfig): ExamifyConfig {
  const validated: ExamifyConfig = {};

  if (typeof config.defaultPoints === 'number' && config.defaultPoints > 0) {
    validated.defaultPoints = config.defaultPoints;
  }

  if (typeof config.outputDir === 'string' && config.outputDir.length > 0) {
    validated.outputDir = config.outputDir;
  }

  if (typeof config.validate === 'boolean') {
    validated.validate = config.validate;
  }

  if (typeof config.title === 'string' && config.title.length > 0) {
    validated.title = config.title;
  }

  return validated;
}

/**
 * Merge CLI options with config file (CLI takes precedence)
 */
export function mergeWithConfig<T extends Record<string, unknown>>(
  cliOptions: T,
  config: ExamifyConfig
): T & ExamifyConfig {
  return {
    ...config,
    ...cliOptions,
  };
}
