/**
 * UX Toolkit - OpenCode Plugin
 *
 * Provides UX review skills, agents, and tools for OpenCode
 */

import { tool } from '@opencode-ai/plugin';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { safeJoin } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// In dist, we're at dist/plugin.js, so go up one level to package root
const UX_TOOLKIT_ROOT = safeJoin(__dirname, '..');

function extractFrontmatter(filePath: string): Record<string, string> | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const frontmatter: Record<string, string> = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    }
    return frontmatter;
  } catch {
    return null;
  }
}

function stripFrontmatter(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

function loadSkillContent(filePath: string): string | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return stripFrontmatter(content);
  } catch {
    return null;
  }
}

interface SkillDirectories {
  uxToolkit: string;
  personal: string;
  project: string | null;
}

function getSkillDirectories(projectDir?: string): SkillDirectories {
  const uxToolkitDir = safeJoin(UX_TOOLKIT_ROOT, 'skills');
  const personalDir = safeJoin(homedir(), '.config', 'opencode', 'skills');
  const projectSkillsDir = projectDir ? safeJoin(projectDir, '.opencode', 'skills') : null;

  return {
    uxToolkit: uxToolkitDir,
    personal: personalDir,
    project: projectSkillsDir,
  };
}

interface ResolvedSkill {
  name: string;
  description: string;
  path: string;
  source: string;
  content: string;
}

function resolveSkill(skillName: string, projectDir?: string): ResolvedSkill | null {
  // Validate skillName is a valid string
  if (typeof skillName !== 'string' || !skillName) {
    return null;
  }

  const dirs = getSkillDirectories(projectDir);

  let targetSource: string | null = null;
  let baseName = skillName;

  if (skillName.startsWith('project:')) {
    targetSource = 'project';
    baseName = skillName.slice(8);
  } else if (skillName.startsWith('personal:')) {
    targetSource = 'personal';
    baseName = skillName.slice(9);
  } else if (skillName.startsWith('ux-toolkit:')) {
    targetSource = 'ux-toolkit';
    baseName = skillName.slice(11);
  }

  const searchOrder = targetSource
    ? [{ dir: dirs[targetSource === 'ux-toolkit' ? 'uxToolkit' : targetSource as keyof SkillDirectories] as string, type: targetSource }]
    : [
        { dir: dirs.project, type: 'project' },
        { dir: dirs.personal, type: 'personal' },
        { dir: dirs.uxToolkit, type: 'ux-toolkit' },
      ].filter(s => s.dir);

  for (const { dir, type } of searchOrder) {
    if (!dir || !existsSync(dir)) continue;

    const exactPath = safeJoin(dir, baseName, 'SKILL.md');
    if (existsSync(exactPath)) {
      const frontmatter = extractFrontmatter(exactPath);
      const content = loadSkillContent(exactPath);
      if (frontmatter && content) {
        return {
          name: frontmatter.name || baseName,
          description: frontmatter.description || '',
          path: exactPath,
          source: type,
          content,
        };
      }
    }
  }

  return null;
}

/**
 * OpenCode Plugin Export
 */
const UxToolkitPlugin = async (_ctx: unknown) => {
  return {
    tool: {
      use_ux_skill: tool({
        description: 'Load a UX Toolkit skill to get detailed guidance for UI/UX review. Skills include: ux-heuristics, wcag-accessibility, visual-design-system, form-patterns, list-page-patterns, detail-page-patterns, modal-patterns, navigation-patterns, and more.',
        args: {
          skill_name: tool.schema.string().describe('Name of the skill to load (e.g., "ux-heuristics", "wcag-accessibility", "form-patterns")'),
        },
        async execute(args, _context) {
          const skill = resolveSkill(args.skill_name);

          if (!skill) {
            return JSON.stringify({
              success: false,
              error: `Skill "${args.skill_name}" not found. Use find_ux_skills to see available skills.`,
            });
          }

          return JSON.stringify({
            success: true,
            skill: {
              name: skill.name,
              description: skill.description,
              source: skill.source,
            },
            content: skill.content,
            message: `Loaded skill "${skill.name}" from ${skill.source}.`,
          });
        },
      }),

      find_ux_skills: tool({
        description: 'List all available UX Toolkit skills with their descriptions',
        args: {
          category: tool.schema.string().optional().describe('Filter by category (core, structure, component, interaction, editor, game, data, framework)'),
        },
        async execute(args, _context) {
          const dirs = getSkillDirectories();
          const allSkills = new Map<string, { name: string; description: string; category: string; source: string }>();

          const sources = [
            { dir: dirs.uxToolkit, type: 'ux-toolkit' },
            { dir: dirs.personal, type: 'personal' },
          ];

          for (const { dir, type } of sources) {
            if (!dir || !existsSync(dir)) continue;

            try {
              const entries = readdirSync(dir, { withFileTypes: true });

              for (const entry of entries) {
                if (entry.isDirectory()) {
                  const skillPath = safeJoin(dir, entry.name, 'SKILL.md');
                  if (existsSync(skillPath)) {
                    const frontmatter = extractFrontmatter(skillPath);
                    if (frontmatter && frontmatter.name) {
                      allSkills.set(frontmatter.name, {
                        name: frontmatter.name,
                        description: frontmatter.description || '',
                        category: frontmatter.category || 'unknown',
                        source: type,
                      });
                    }
                  }
                }
              }
            } catch {
              // Skip unreadable directories
            }
          }

          let skills = Array.from(allSkills.values());

          if (args.category) {
            skills = skills.filter(s => s.category === args.category);
          }

          const grouped: Record<string, typeof skills> = {};
          for (const skill of skills) {
            const cat = skill.category || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(skill);
          }

          return JSON.stringify({
            total: skills.length,
            categories: Object.keys(grouped),
            skills: grouped,
          });
        },
      }),
    },
  };
};

export default UxToolkitPlugin;
