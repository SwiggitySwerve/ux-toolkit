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

    it('help should document --only flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--only');
    });
  });

  describe('uninstall command', () => {
    it('help should document uninstall command', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('uninstall');
    });
  });

  describe('upgrade command', () => {
    it('help should document upgrade command', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('upgrade');
    });
  });

  describe('info command', () => {
    it('should show platform information', () => {
      const { stdout, exitCode } = runCli('info');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Platform');
      expect(stdout).toContain('OpenCode');
      expect(stdout).toContain('Claude Code');
      expect(stdout).toContain('Skills');
      expect(stdout).toContain('Agents');
      expect(stdout).toContain('Commands');
    });
  });

  describe('target flags', () => {
    it('help should document --opencode flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--opencode');
    });

    it('help should document --claude flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--claude');
    });
  });

  describe('environment variables', () => {
    it('help should document environment variables', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('UX_TOOLKIT_CONFIG_DIR');
      expect(stdout).toContain('OPENCODE_CONFIG_DIR');
      expect(stdout).toContain('XDG_CONFIG_HOME');
    });
  });

  describe('status command', () => {
    it('should show installation status', () => {
      const { stdout, exitCode } = runCli('status');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Installation Status');
      expect(stdout).toContain('OpenCode');
      expect(stdout).toContain('Claude Code');
      // Note: Skills/Agents/Commands only shown when platform is installed
      // In CI, neither platform exists so we just verify the structure
      expect(stdout).toContain('Summary');
    });

    it('help should document status command', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('status');
    });
  });

  describe('doctor command', () => {
    it('should run diagnostics', () => {
      const { stdout, exitCode } = runCli('doctor');
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Diagnostics');
      expect(stdout).toContain('Summary');
    });

    it('help should document doctor command', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('doctor');
    });
  });

  describe('new options', () => {
    it('help should document --all flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--all');
      expect(stdout).toContain('-a');
    });

    it('help should document --skill flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--skill');
    });

    it('help should document --agent flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--agent');
    });

    it('help should document --command flag', () => {
      const { stdout } = runCli('--help');
      expect(stdout).toContain('--command');
    });
  });
});
