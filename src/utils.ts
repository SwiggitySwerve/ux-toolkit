/**
 * Utility functions for ux-toolkit
 */

import { join as pathJoin } from 'node:path';

/**
 * Safe wrapper around path.join that ensures all arguments are strings.
 * This prevents "paths[0] must be string, got object" errors in bundled code.
 */
export function safeJoin(...paths: unknown[]): string {
  const stringPaths: string[] = [];

  for (const p of paths) {
    if (typeof p === 'string') {
      stringPaths.push(p);
    } else if (p != null) {
      // Try to convert to string, but filter out useless conversions
      const str = String(p);
      if (str && str !== '[object Object]' && str !== 'undefined' && str !== 'null') {
        stringPaths.push(str);
      }
    }
  }

  if (stringPaths.length === 0) {
    return '.';
  }

  try {
    return pathJoin(...stringPaths);
  } catch {
    // Fallback: manual join with path separator detection
    const sep = stringPaths[0].includes('\\') ? '\\' : '/';
    return stringPaths.join(sep).replace(/[/\\]+/g, sep);
  }
}

/**
 * Validates that a value is a non-empty string.
 */
export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
