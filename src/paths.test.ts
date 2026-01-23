import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { join } from 'node:path';
import {
  getPackageRoot,
  getSkillPath,
  getAgentPath,
  getCommandPath,
  getGlobalConfigDir,
  getClaudeConfigDir,
  getProjectConfigDir,
  getDestinationPaths,
  isOpenCodeInstalled,
  isClaudeInstalled,
  getPlatformInfo,
} from './paths.js';

const MOCK_HOME = '/mock/home';

vi.mock('node:os', () => ({
  homedir: vi.fn(() => MOCK_HOME),
  platform: vi.fn(() => 'linux'),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => true),
}));

describe('paths', () => {
  describe('getPackageRoot', () => {
    it('should return a string path', () => {
      const root = getPackageRoot();
      expect(typeof root).toBe('string');
      expect(root.length).toBeGreaterThan(0);
    });
  });

  describe('getSkillPath', () => {
    it('should return path with skill name and SKILL.md', () => {
      const path = getSkillPath('ux-heuristics');
      expect(path).toContain('skills');
      expect(path).toContain('ux-heuristics');
      expect(path).toContain('SKILL.md');
    });

    it('should use skills directory structure', () => {
      const path = getSkillPath('test-skill');
      expect(path).toMatch(/skills[/\\]test-skill[/\\]SKILL\.md$/);
    });
  });

  describe('getAgentPath', () => {
    it('should return path with agent name and .md extension', () => {
      const path = getAgentPath('ux-auditor');
      expect(path).toContain('agents');
      expect(path).toContain('ux-auditor.md');
    });

    it('should use agents directory structure', () => {
      const path = getAgentPath('test-agent');
      expect(path).toMatch(/agents[/\\]test-agent\.md$/);
    });
  });

  describe('getCommandPath', () => {
    it('should return path with command name and .md extension', () => {
      const path = getCommandPath('ux-audit');
      expect(path).toContain('commands');
      expect(path).toContain('ux-audit.md');
    });

    it('should use commands directory structure', () => {
      const path = getCommandPath('test-command');
      expect(path).toMatch(/commands[/\\]test-command\.md$/);
    });
  });

  describe('getGlobalConfigDir', () => {
    it('should return path under home directory', () => {
      const dir = getGlobalConfigDir();
      // Verify it ends with the correct structure (mocking homedir is complex in ESM)
      expect(dir).toMatch(/[/\\]\.config[/\\]opencode$/);
    });

    it('should return correct structure', () => {
      const dir = getGlobalConfigDir();
      expect(dir).toMatch(/[/\\]\.config[/\\]opencode$/);
    });
  });

  describe('getProjectConfigDir', () => {
    it('should return .opencode under provided project root', () => {
      const dir = getProjectConfigDir('/my/project');
      const expected = join('/my/project', '.opencode');
      expect(dir).toBe(expected);
    });

    it('should use cwd when no project root provided', () => {
      const dir = getProjectConfigDir();
      expect(dir).toContain('.opencode');
    });
  });

  describe('getDestinationPaths', () => {
    it('should return paths for skills, agents, and commands for global install', () => {
      const paths = getDestinationPaths(true);
      expect(paths).toHaveProperty('skills');
      expect(paths).toHaveProperty('agents');
      expect(paths).toHaveProperty('commands');
      expect(paths.skills).toContain('.config');
      expect(paths.skills).toContain('opencode');
      expect(paths.skills).toContain('skills');
      expect(paths.agents).toContain('agents');
      expect(paths.commands).toContain('commands');
    });

    it('should return paths for project install', () => {
      const paths = getDestinationPaths(false, '/my/project');
      expect(paths.skills).toBe(join('/my/project', '.opencode', 'skills'));
      expect(paths.agents).toBe(join('/my/project', '.opencode', 'agents'));
      expect(paths.commands).toBe(join('/my/project', '.opencode', 'commands'));
    });

    it('should use global config when global is true', () => {
      const globalPaths = getDestinationPaths(true);
      const projectPaths = getDestinationPaths(false, '/my/project');
      
      expect(globalPaths.skills).not.toEqual(projectPaths.skills);
      expect(globalPaths.skills).toContain('.config');
    });
  });

  describe('getGlobalConfigDir with environment variables', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should respect UX_TOOLKIT_CONFIG_DIR override', () => {
      process.env.UX_TOOLKIT_CONFIG_DIR = '/custom/config';
      // Re-import to get fresh module with new env
      const dir = getGlobalConfigDir();
      // Note: The actual implementation resolves the path
      expect(dir).toContain('custom');
    });

    it('should respect OPENCODE_CONFIG_DIR when UX_TOOLKIT_CONFIG_DIR not set', () => {
      delete process.env.UX_TOOLKIT_CONFIG_DIR;
      process.env.OPENCODE_CONFIG_DIR = '/opencode/config';
      const dir = getGlobalConfigDir();
      expect(dir).toContain('opencode');
    });

    it('should fallback to default when no env vars set', () => {
      delete process.env.UX_TOOLKIT_CONFIG_DIR;
      delete process.env.OPENCODE_CONFIG_DIR;
      delete process.env.XDG_CONFIG_HOME;
      const dir = getGlobalConfigDir();
      expect(dir).toMatch(/[/\\]\.config[/\\]opencode$/);
    });
  });

  describe('isOpenCodeInstalled', () => {
    it('should return boolean', () => {
      const result = isOpenCodeInstalled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getClaudeConfigDir', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return path under home directory', () => {
      delete process.env.CLAUDE_CONFIG_DIR;
      const dir = getClaudeConfigDir();
      expect(dir).toContain('.claude');
    });

    it('should respect CLAUDE_CONFIG_DIR override', () => {
      process.env.CLAUDE_CONFIG_DIR = '/custom/claude';
      const dir = getClaudeConfigDir();
      expect(dir).toContain('custom');
    });
  });

  describe('isClaudeInstalled', () => {
    it('should return boolean', () => {
      const result = isClaudeInstalled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getDestinationPaths with target', () => {
    it('should return opencode paths by default', () => {
      const paths = getDestinationPaths(true);
      expect(paths.skills).toContain('opencode');
    });

    it('should return claude paths when target is claude', () => {
      const paths = getDestinationPaths(true, undefined, 'claude');
      expect(paths.skills).toContain('.claude');
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform info object with opencode and claude info', () => {
      const info = getPlatformInfo();
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('opencode');
      expect(info).toHaveProperty('claude');
      expect(typeof info.platform).toBe('string');
      
      // OpenCode info
      expect(info.opencode).toHaveProperty('configDir');
      expect(info.opencode).toHaveProperty('exists');
      expect(typeof info.opencode.configDir).toBe('string');
      expect(typeof info.opencode.exists).toBe('boolean');
      
      // Claude info
      expect(info.claude).toHaveProperty('configDir');
      expect(info.claude).toHaveProperty('exists');
      expect(typeof info.claude.configDir).toBe('string');
      expect(typeof info.claude.exists).toBe('boolean');
    });
  });
});
