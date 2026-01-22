import { describe, it, expect, vi } from 'vitest';
import { join } from 'node:path';
import {
  getPackageRoot,
  getSkillPath,
  getAgentPath,
  getCommandPath,
  getGlobalConfigDir,
  getProjectConfigDir,
  getDestinationPaths,
} from './paths.js';

const MOCK_HOME = '/mock/home';

vi.mock('node:os', () => ({
  homedir: vi.fn(() => MOCK_HOME),
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
      const expected = join(MOCK_HOME, '.config', 'opencode');
      expect(dir).toBe(expected);
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
});
