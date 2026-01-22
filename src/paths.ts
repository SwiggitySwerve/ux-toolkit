import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function getGlobalConfigDir(): string {
  return join(homedir(), '.config', 'opencode');
}

export function getProjectConfigDir(projectRoot: string = process.cwd()): string {
  return join(projectRoot, '.opencode');
}

export function getDestinationPaths(global: boolean, projectRoot?: string) {
  const baseDir = global ? getGlobalConfigDir() : getProjectConfigDir(projectRoot);

  return {
    skills: join(baseDir, 'skills'),
    agents: join(baseDir, 'agents'),
    commands: join(baseDir, 'commands'),
  };
}
