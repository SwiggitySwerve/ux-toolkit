import { homedir, platform } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

// Get the directory of the current module
// Works in both ESM and CJS contexts
function getCurrentDirname(): string {
  // Try ESM approach first (import.meta.url)
  try {
    if (import.meta?.url) {
      return dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // ESM approach failed
  }
  
  // CJS approach: resolve the package from node_modules
  // When bundled, we can find the package root by looking up
  // the package.json location using require.resolve
  try {
    // This works because package.json is always at the package root
    const packageJsonPath = require.resolve('ux-toolkit/package.json');
    // Return the dist directory (to match ESM behavior where import.meta.url points to dist/)
    return join(dirname(packageJsonPath), 'dist');
  } catch {
    // Package not found in node_modules
  }
  
  // Fallback: Use process.cwd() and check if we're in the package directory
  // This handles the case when running from the package source directory
  const cwd = process.cwd();
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('node:fs');
    const pkgPath = resolve(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pkg = require(pkgPath);
      if (pkg.name === 'ux-toolkit') {
        return resolve(cwd, 'dist');
      }
    }
  } catch {
    // Failed to read package.json
  }
  
  // Last resort: assume we're running from dist folder in cwd
  return resolve(cwd, 'dist');
}

const currentDirname = getCurrentDirname();

export function getPackageRoot(): string {
  return join(currentDirname, '..');
}

export function getSkillPath(skillName: string): string {
  return join(getPackageRoot(), 'skills', skillName, 'SKILL.md');
}

export function getAgentPath(agentName: string): string {
  return join(getPackageRoot(), 'agents', `${agentName}.md`);
}

export function getCommandPath(commandName: string): string {
  return join(getPackageRoot(), 'commands', `${commandName}.md`);
}

/**
 * Get the global OpenCode config directory.
 * 
 * Priority:
 * 1. UX_TOOLKIT_CONFIG_DIR env var (explicit override)
 * 2. OPENCODE_CONFIG_DIR env var (OpenCode convention)
 * 3. Platform-specific defaults:
 *    - Linux: $XDG_CONFIG_HOME/opencode or ~/.config/opencode
 *    - macOS: ~/.config/opencode
 *    - Windows: ~/.config/opencode (matches OpenCode behavior)
 */
export function getGlobalConfigDir(): string {
  // Allow explicit override
  if (process.env.UX_TOOLKIT_CONFIG_DIR) {
    return resolve(process.env.UX_TOOLKIT_CONFIG_DIR);
  }
  
  // OpenCode's own config dir override
  if (process.env.OPENCODE_CONFIG_DIR) {
    return resolve(process.env.OPENCODE_CONFIG_DIR);
  }
  
  const home = homedir();
  const currentPlatform = platform();
  
  // Linux: Respect XDG Base Directory spec
  if (currentPlatform === 'linux' && process.env.XDG_CONFIG_HOME) {
    return join(process.env.XDG_CONFIG_HOME, 'opencode');
  }
  
  // All platforms default to ~/.config/opencode (matches OpenCode behavior)
  return join(home, '.config', 'opencode');
}

/**
 * Check if the OpenCode config directory exists.
 * Useful for pre-flight checks before installation.
 */
export function isOpenCodeInstalled(): boolean {
  return existsSync(getGlobalConfigDir());
}

/**
 * Get the Claude Code config directory.
 * Claude Code always uses ~/.claude/ on all platforms.
 */
export function getClaudeConfigDir(): string {
  // Allow explicit override
  if (process.env.CLAUDE_CONFIG_DIR) {
    return resolve(process.env.CLAUDE_CONFIG_DIR);
  }
  
  return join(homedir(), '.claude');
}

/**
 * Check if Claude Code is installed.
 */
export function isClaudeInstalled(): boolean {
  return existsSync(getClaudeConfigDir());
}

/**
 * Supported installation targets
 */
export type InstallTarget = 'opencode' | 'claude';

/**
 * Get platform information for diagnostics
 */
export function getPlatformInfo(): { 
  platform: string; 
  opencode: { configDir: string; exists: boolean };
  claude: { configDir: string; exists: boolean };
} {
  const opencodeDir = getGlobalConfigDir();
  const claudeDir = getClaudeConfigDir();
  return {
    platform: platform(),
    opencode: {
      configDir: opencodeDir,
      exists: existsSync(opencodeDir),
    },
    claude: {
      configDir: claudeDir,
      exists: existsSync(claudeDir),
    },
  };
}

export function getProjectConfigDir(projectRoot: string = process.cwd(), target: InstallTarget = 'opencode'): string {
  // Claude Code doesn't have project-level plugins in the same way
  // but we can support .claude/ directory for consistency
  const dirName = target === 'claude' ? '.claude' : '.opencode';
  return join(projectRoot, dirName);
}

export interface DestinationPathsOptions {
  global?: boolean;
  projectRoot?: string;
  target?: InstallTarget;
}

export function getDestinationPaths(global: boolean, projectRoot?: string, target: InstallTarget = 'opencode') {
  let baseDir: string;
  
  if (global) {
    baseDir = target === 'claude' ? getClaudeConfigDir() : getGlobalConfigDir();
  } else {
    baseDir = getProjectConfigDir(projectRoot, target);
  }

  return {
    skills: join(baseDir, 'skills'),
    agents: join(baseDir, 'agents'),
    commands: join(baseDir, 'commands'),
  };
}
