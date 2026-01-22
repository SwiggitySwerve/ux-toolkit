export const SKILLS = [
  {
    name: 'ux-heuristics',
    description: "Nielsen's 10 usability heuristics with evaluation methodology",
    category: 'core',
  },
  {
    name: 'wcag-accessibility',
    description: 'WCAG 2.2 compliance checklist and ARIA patterns',
    category: 'core',
  },
  {
    name: 'visual-design-system',
    description: 'Layout, typography, color theory, spacing systems',
    category: 'core',
  },
  {
    name: 'interaction-patterns',
    description: 'Micro-interactions, loading states, feedback mechanisms',
    category: 'core',
  },
  {
    name: 'react-ux-patterns',
    description: 'React/Next.js specific UX patterns',
    category: 'framework',
  },
  {
    name: 'mobile-responsive-ux',
    description: 'Touch targets, gestures, responsive patterns',
    category: 'core',
  },
] as const;

export const AGENTS = [
  {
    name: 'ux-auditor',
    description: 'Full UX audit against heuristics (read-only)',
    mode: 'analysis',
  },
  {
    name: 'ux-engineer',
    description: 'UX analysis + implements fixes',
    mode: 'fix',
  },
  {
    name: 'accessibility-auditor',
    description: 'WCAG 2.2 compliance review (read-only)',
    mode: 'analysis',
  },
  {
    name: 'accessibility-engineer',
    description: 'Accessibility fixes',
    mode: 'fix',
  },
  {
    name: 'visual-reviewer',
    description: 'Design system consistency check',
    mode: 'analysis',
  },
  {
    name: 'interaction-reviewer',
    description: 'Micro-interactions and feedback review',
    mode: 'analysis',
  },
] as const;

export const COMMANDS = [
  {
    name: 'ux-audit',
    description: 'Comprehensive UX audit',
  },
  {
    name: 'a11y-check',
    description: 'Quick accessibility scan',
  },
  {
    name: 'design-review',
    description: 'Visual consistency check',
  },
  {
    name: 'screenshot-review',
    description: 'Visual review from screenshot',
  },
] as const;

export type SkillName = (typeof SKILLS)[number]['name'];
export type AgentName = (typeof AGENTS)[number]['name'];
export type CommandName = (typeof COMMANDS)[number]['name'];
