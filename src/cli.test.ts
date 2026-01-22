import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const CLI_PATH = join(__dirname, '..', 'dist', 'cli.js');

function runCli(args: string = ''): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1,
    };
  }
}

describe('CLI', () => {
  describe('help', () => {
    it('should show help when --help flag is provided', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('ux-toolkit');
      expect(stdout).toContain('USAGE');
      expect(stdout).toContain('COMMANDS');
      expect(stdout).toContain('install');
      expect(stdout).toContain('list');
    });

    it('should show help when -h flag is provided', () => {
      const { stdout } = runCli('-h');
      expect(stdout).toContain('ux-toolkit');
      expect(stdout).toContain('USAGE');
    });

    it('should show help when no command is provided', () => {
      const { stdout, exitCode } = runCli('');
      expect(stdout).toContain('ux-toolkit');
      expect(exitCode).toBe(0);
    });
  });

  describe('list command', () => {
    it('should list skills', () => {
      const { stdout } = runCli('list');
      expect(stdout).toContain('Skills:');
      expect(stdout).toContain('ux-heuristics');
      expect(stdout).toContain('wcag-accessibility');
    });

    it('should list agents', () => {
      const { stdout } = runCli('list');
      expect(stdout).toContain('Agents:');
      expect(stdout).toContain('ux-auditor');
      expect(stdout).toContain('ux-engineer');
    });

    it('should list commands', () => {
      const { stdout } = runCli('list');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('/ux-audit');
      expect(stdout).toContain('/a11y-check');
    });
  });

  describe('unknown command', () => {
    it('should show error for unknown command', () => {
      const { stderr, exitCode } = runCli('unknown-command');
      expect(stderr).toContain('Unknown command');
      expect(exitCode).toBe(1);
    });
  });

  describe('options', () => {
    it('help should document --global flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--global');
      expect(stdout).toContain('-g');
    });

    it('help should document --project flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--project');
      expect(stdout).toContain('-p');
    });

    it('help should document --force flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--force');
      expect(stdout).toContain('-f');
    });

    it('help should document --verbose flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--verbose');
      expect(stdout).toContain('-v');
    });
  });
});
