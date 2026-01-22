# UX Toolkit

AI-powered UI/UX review toolkit with skills, agents, and commands for OpenCode and other AI coding assistants.

## Features

- **Skills**: Reusable UX knowledge (heuristics, accessibility, design systems)
- **Agents**: Specialized AI assistants for UX audits and fixes
- **Commands**: Quick-trigger UX workflows
- **Framework-agnostic**: Works with React, Vue, Svelte, vanilla JS
- **React-optimized**: Deep React/Next.js patterns included

## Quick Start

### Install globally for OpenCode

```bash
npx ux-toolkit install --global
```

This installs skills, agents, and commands to `~/.config/opencode/`.

### Install for a specific project

```bash
npx ux-toolkit install --project
```

This installs to `.opencode/` in your current directory.

## What's Included

### Skills

| Skill | Description |
|-------|-------------|
| `ux-heuristics` | Nielsen's 10 usability heuristics with evaluation methodology |
| `wcag-accessibility` | WCAG 2.2 compliance checklist and ARIA patterns |
| `visual-design-system` | Layout, typography, color theory, spacing systems |
| `interaction-patterns` | Micro-interactions, loading states, feedback mechanisms |
| `react-ux-patterns` | React/Next.js specific UX patterns |
| `mobile-responsive-ux` | Touch targets, gestures, responsive patterns |

### Agents

| Agent | Mode | Description |
|-------|------|-------------|
| `ux-auditor` | Analysis | Full UX audit against heuristics (read-only) |
| `ux-engineer` | Fix | UX analysis + implements fixes |
| `accessibility-auditor` | Analysis | WCAG 2.2 compliance review (read-only) |
| `accessibility-engineer` | Fix | Accessibility fixes |
| `visual-reviewer` | Analysis | Design system consistency check |
| `interaction-reviewer` | Analysis | Micro-interactions and feedback review |

### Commands

| Command | Description |
|---------|-------------|
| `/ux-audit` | Comprehensive UX audit |
| `/a11y-check` | Quick accessibility scan |
| `/design-review` | Visual consistency check |
| `/screenshot-review` | Visual review from screenshot |

## Usage Examples

### In OpenCode

```bash
# Run a full UX audit
/ux-audit src/components/Button.tsx

# Check accessibility
/a11y-check src/pages/index.tsx

# Invoke agent directly
@ux-auditor Review the login flow for usability issues
```

### With Playwright MCP

For visual inspection capabilities, add Playwright MCP to your config:

```json
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest", "--caps", "vision"],
      "enabled": true
    }
  }
}
```

## Manual Installation

If you prefer to install manually:

```bash
# Clone the repo
git clone https://github.com/swiggityswerve/ux-toolkit.git

# Copy to global config
cp -r ux-toolkit/skills/* ~/.config/opencode/skills/
cp -r ux-toolkit/agents/* ~/.config/opencode/agents/
cp -r ux-toolkit/commands/* ~/.config/opencode/commands/
```

## Customization

### Override agent permissions

In your `opencode.json`:

```json
{
  "agent": {
    "ux-engineer": {
      "permission": {
        "edit": "ask"
      }
    }
  }
}
```

### Add custom skills

Create additional skills in `~/.config/opencode/skills/my-skill/SKILL.md`.

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

MIT
