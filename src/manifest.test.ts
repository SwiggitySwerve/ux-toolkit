import { describe, it, expect } from 'vitest';
import { SKILLS, AGENTS, COMMANDS } from './manifest.js';

describe('manifest', () => {
  describe('SKILLS', () => {
    it('should export an array of skills', () => {
      expect(Array.isArray(SKILLS)).toBe(true);
      expect(SKILLS.length).toBeGreaterThan(0);
    });

    it('should have 25 skills', () => {
      expect(SKILLS.length).toBe(25);
    });

    it('each skill should have required properties', () => {
      for (const skill of SKILLS) {
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('description');
        expect(skill).toHaveProperty('category');
        expect(typeof skill.name).toBe('string');
        expect(typeof skill.description).toBe('string');
        expect(typeof skill.category).toBe('string');
        expect(skill.name.length).toBeGreaterThan(0);
        expect(skill.description.length).toBeGreaterThan(0);
      }
    });

    it('skill names should be unique', () => {
      const names = SKILLS.map((s) => s.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should include expected core skills', () => {
      const skillNames = SKILLS.map((s) => s.name);
      expect(skillNames).toContain('ux-heuristics');
      expect(skillNames).toContain('wcag-accessibility');
      expect(skillNames).toContain('visual-design-system');
    });

    it('should have valid categories', () => {
      const validCategories = ['core', 'structure', 'component', 'interaction', 'editor', 'game', 'data', 'framework'];
      for (const skill of SKILLS) {
        expect(validCategories).toContain(skill.category);
      }
    });
  });

  describe('AGENTS', () => {
    it('should export an array of agents', () => {
      expect(Array.isArray(AGENTS)).toBe(true);
      expect(AGENTS.length).toBeGreaterThan(0);
    });

    it('should have 18 agents', () => {
      expect(AGENTS.length).toBe(18);
    });

    it('each agent should have required properties', () => {
      for (const agent of AGENTS) {
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('description');
        expect(agent).toHaveProperty('mode');
        expect(typeof agent.name).toBe('string');
        expect(typeof agent.description).toBe('string');
        expect(typeof agent.mode).toBe('string');
        expect(agent.name.length).toBeGreaterThan(0);
        expect(agent.description.length).toBeGreaterThan(0);
      }
    });

    it('agent names should be unique', () => {
      const names = AGENTS.map((a) => a.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should include expected agents', () => {
      const agentNames = AGENTS.map((a) => a.name);
      expect(agentNames).toContain('ux-auditor');
      expect(agentNames).toContain('ux-engineer');
      expect(agentNames).toContain('accessibility-auditor');
    });

    it('should have valid modes', () => {
      const validModes = ['analysis', 'fix'];
      for (const agent of AGENTS) {
        expect(validModes).toContain(agent.mode);
      }
    });
  });

  describe('COMMANDS', () => {
    it('should export an array of commands', () => {
      expect(Array.isArray(COMMANDS)).toBe(true);
      expect(COMMANDS.length).toBeGreaterThan(0);
    });

    it('should have 4 commands', () => {
      expect(COMMANDS.length).toBe(4);
    });

    it('each command should have required properties', () => {
      for (const command of COMMANDS) {
        expect(command).toHaveProperty('name');
        expect(command).toHaveProperty('description');
        expect(typeof command.name).toBe('string');
        expect(typeof command.description).toBe('string');
        expect(command.name.length).toBeGreaterThan(0);
        expect(command.description.length).toBeGreaterThan(0);
      }
    });

    it('command names should be unique', () => {
      const names = COMMANDS.map((c) => c.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should include expected commands', () => {
      const commandNames = COMMANDS.map((c) => c.name);
      expect(commandNames).toContain('ux-audit');
      expect(commandNames).toContain('ux-a11y-check');
      expect(commandNames).toContain('ux-design-review');
      expect(commandNames).toContain('ux-screenshot-review');
    });
  });
});
