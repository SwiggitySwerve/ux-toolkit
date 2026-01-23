# UX Toolkit

AI-powered UI/UX review toolkit with skills, agents, and commands for OpenCode and other AI coding assistants.

## Features

- **25 Skills**: Comprehensive UX knowledge from heuristics to game UI patterns
- **18 Agents**: Specialized reviewers for different page types (list, detail, editor, game, replay, cards)
- **Commands**: Quick-trigger UX workflows
- **Severity Weights**: All checklists categorized as Critical/Major/Minor
- **Parallel Review**: Dispatch multiple specialized agents simultaneously

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

### Skills (25)

#### Core UX
| Skill | Description |
|-------|-------------|
| `ux-heuristics` | Nielsen's 10 usability heuristics with evaluation methodology |
| `wcag-accessibility` | WCAG 2.2 compliance checklist and ARIA patterns |
| `visual-design-system` | Layout, typography, color theory, spacing systems |
| `interaction-patterns` | Micro-interactions, loading states, feedback mechanisms |
| `mobile-responsive-ux` | Touch targets, gestures, responsive patterns |

#### Page Structure
| Skill | Description |
|-------|-------------|
| `page-structure-patterns` | Base requirements for page states, layout, and structure |
| `list-page-patterns` | Filters, sorting, pagination, and grid/table displays |
| `detail-page-patterns` | Headers, tabs, multi-column layouts, related data |
| `navigation-patterns` | Sidebar, mobile drawer, breadcrumbs, app shell |

#### Components
| Skill | Description |
|-------|-------------|
| `modal-patterns` | Confirmation, edit, selector, and wizard modals |
| `form-patterns` | Validation, field layouts, multi-step wizards |
| `data-density-patterns` | Dense layouts, z-index, overflow, readability |
| `toast-notification-patterns` | Toast types, timing, queuing, accessibility |

#### Interactions
| Skill | Description |
|-------|-------------|
| `keyboard-shortcuts-patterns` | Command palette (Cmd+K), shortcut registry |
| `drag-drop-patterns` | Drag preview, drop zones, keyboard alternatives |

#### Editor/Workspace
| Skill | Description |
|-------|-------------|
| `editor-workspace-patterns` | Multi-tab editors, dirty state, undo/redo, auto-save |
| `comparison-patterns` | Side-by-side comparison, diff highlighting |
| `split-panel-patterns` | Resizable panels, dividers, collapsible sidebars |

#### Game/Interactive
| Skill | Description |
|-------|-------------|
| `canvas-grid-patterns` | Hex grids, tactical maps, pan/zoom, tokens, coordinates |
| `turn-based-ui-patterns` | Phase banners, turn indicators, action bars, game state |
| `playback-replay-patterns` | VCR controls, timeline scrubbing, speed selection |
| `status-visualization-patterns` | Health bars, progress meters, heat gauges, pip displays |

#### Data Display
| Skill | Description |
|-------|-------------|
| `info-card-patterns` | Compact/standard/expanded cards, stat blocks, badges |
| `event-timeline-patterns` | Activity feeds, audit logs, chronological events |

#### Framework
| Skill | Description |
|-------|-------------|
| `react-ux-patterns` | React/Next.js specific UX patterns |

### Agents (18)

#### General Purpose
| Agent | Mode | Description |
|-------|------|-------------|
| `ux-auditor` | Analysis | Full UX audit against heuristics (read-only) |
| `ux-engineer` | Fix | UX analysis + implements fixes |
| `accessibility-auditor` | Analysis | WCAG 2.2 compliance review (read-only) |
| `accessibility-engineer` | Fix | Accessibility fixes |
| `visual-reviewer` | Analysis | Design system consistency check |
| `interaction-reviewer` | Analysis | Micro-interactions and feedback review |

#### Specialized Page Reviewers
| Agent | Mode | Description |
|-------|------|-------------|
| `list-page-reviewer` | Analysis | List/browse page UX review |
| `detail-page-reviewer` | Analysis | Detail/entity page UX review |
| `navigation-reviewer` | Analysis | Navigation and routing review |
| `form-reviewer` | Analysis | Form and input UX review |
| `density-reviewer` | Analysis | Data density and layout review |

#### Advanced Specialized Reviewers
| Agent | Mode | Description |
|-------|------|-------------|
| `editor-reviewer` | Analysis | Editor/workspace UI with multi-tab, drag-drop |
| `comparison-reviewer` | Analysis | Side-by-side comparison and diff UIs |
| `settings-reviewer` | Analysis | Settings, preferences, and configuration pages |

#### Game & Interactive Reviewers
| Agent | Mode | Description |
|-------|------|-------------|
| `game-ui-reviewer` | Analysis | Tactical maps, turn-based combat, hex grids, status displays |
| `replay-reviewer` | Analysis | Playback controls, timeline scrubbing, event feeds |
| `card-reviewer` | Analysis | Info cards, stat blocks, entity displays with density levels |
| `panel-reviewer` | Analysis | Resizable panels, collapsible sidebars, split views |

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

# Use specialized reviewer for a list page
@list-page-reviewer Review /users page against list-page-patterns

# Use editor reviewer for complex workspace
@editor-reviewer Review the Customizer page for editor patterns

# Use game reviewer for tactical interfaces
@game-ui-reviewer Review the combat screen for grid and turn-based patterns

# Use replay reviewer for playback interfaces
@replay-reviewer Review the game replay viewer
```

### Parallel Review (Recommended)

For comprehensive review, dispatch multiple specialized agents:

```bash
# In your AI assistant, dispatch these in parallel:
@list-page-reviewer Review /items page
@navigation-reviewer Review sidebar navigation  
@density-reviewer Review dashboard layout
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

## Severity Weights

All audit checklists use severity weights to help prioritize fixes:

| Severity | Meaning | Action |
|----------|---------|--------|
| **[CRITICAL]** | Accessibility violation, data loss risk, users blocked | Must fix before release |
| **[MAJOR]** | Significant UX problems, confusion, inefficiency | Should fix soon |
| **[MINOR]** | Polish items, nice-to-have improvements | Fix when time permits |

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
# test
