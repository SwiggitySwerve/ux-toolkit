export const SKILLS = [
  // Core UX Skills
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
    name: 'mobile-responsive-ux',
    description: 'Touch targets, gestures, responsive patterns',
    category: 'core',
  },

  // Page Structure Skills
  {
    name: 'page-structure-patterns',
    description: 'Base requirements for page states, layout, and structure',
    category: 'structure',
  },
  {
    name: 'list-page-patterns',
    description: 'Filters, sorting, pagination, and grid/table displays',
    category: 'structure',
  },
  {
    name: 'detail-page-patterns',
    description: 'Headers, tabs, multi-column layouts, related data',
    category: 'structure',
  },
  {
    name: 'navigation-patterns',
    description: 'Sidebar, mobile drawer, breadcrumbs, app shell',
    category: 'structure',
  },

  // Component Skills
  {
    name: 'modal-patterns',
    description: 'Confirmation, edit, selector, and wizard modals',
    category: 'component',
  },
  {
    name: 'form-patterns',
    description: 'Validation, field layouts, multi-step wizards',
    category: 'component',
  },
  {
    name: 'data-density-patterns',
    description: 'Dense layouts, z-index, overflow, readability',
    category: 'component',
  },

  // Framework Skills
  {
    name: 'react-ux-patterns',
    description: 'React/Next.js specific UX patterns',
    category: 'framework',
  },
] as const;

export const AGENTS = [
  // General Purpose Agents
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

  // Specialized Page Reviewers (for parallel dispatch)
  {
    name: 'list-page-reviewer',
    description: 'List/browse page UX review',
    mode: 'analysis',
  },
  {
    name: 'detail-page-reviewer',
    description: 'Detail/entity page UX review',
    mode: 'analysis',
  },
  {
    name: 'navigation-reviewer',
    description: 'Navigation and routing review',
    mode: 'analysis',
  },
  {
    name: 'form-reviewer',
    description: 'Form and input UX review',
    mode: 'analysis',
  },
  {
    name: 'density-reviewer',
    description: 'Data density and layout review',
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
