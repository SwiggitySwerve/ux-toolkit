#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { install, uninstall, getStatus } from './installer.js';
import { SKILLS, AGENTS, COMMANDS } from './manifest.js';
import { getPlatformInfo, isOpenCodeInstalled, isClaudeInstalled, type InstallTarget } from './paths.js';
import { safeJoin } from './utils.js';

// Prompting utility
async function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function promptYesNo(question: string, defaultYes = true): Promise<boolean> {
  const suffix = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await prompt(`${question} ${suffix} `);
  
  if (answer === '') return defaultYes;
  return answer === 'y' || answer === 'yes';
}

const HELP = `
ux-toolkit - AI-powered UI/UX review toolkit

USAGE:
  npx ux-toolkit <command> [options]

COMMANDS:
  install     Install skills, agents, and commands
  uninstall   Remove installed skills, agents, and commands
  upgrade     Reinstall all components (alias for install --force)
  status      Show what's installed vs available
  doctor      Diagnose installation issues
  list        List available components
  info        Show platform and config information

TARGET (choose one):
  --opencode        Target OpenCode (default) - ~/.config/opencode
  --claude          Target Claude Code - ~/.claude

SCOPE:
  --global, -g      Install to global config (default)
  --project, -p     Install to project config (.opencode/ or .claude/)

OPTIONS:
  --all, -a         Install to all detected platforms (no prompt)
  --force, -f       Overwrite existing files
  --verbose, -v     Verbose output
  --only            Install specific categories (skills,agents,commands)
  --skill           Install specific skill(s) by name (can repeat)
  --agent           Install specific agent(s) by name (can repeat)
  --command         Install specific command(s) by name (can repeat)
  --help, -h        Show this help

ENVIRONMENT:
  UX_TOOLKIT_CONFIG_DIR   Override config directory
  OPENCODE_CONFIG_DIR     OpenCode config directory override
  CLAUDE_CONFIG_DIR       Claude Code config directory override
  XDG_CONFIG_HOME         Linux XDG config home (respected)

EXAMPLES:
  # OpenCode (default)
  npx ux-toolkit install --global
  npx ux-toolkit install --opencode --global
  
  # Claude Code
  npx ux-toolkit install --claude --global
  npx ux-toolkit uninstall --claude --global
  
  # Both platforms
  npx ux-toolkit install --opencode --global && npx ux-toolkit install --claude --global
  
  # Project-level
  npx ux-toolkit install --project
  npx ux-toolkit install --claude --project
  
  # Selective
  npx ux-toolkit install --global --only=skills,agents
  
  # Other commands
  npx ux-toolkit info
  npx ux-toolkit list
`;

type Category = 'skills' | 'agents' | 'commands';

function parseCategories(only: string | undefined): Category[] | undefined {
  if (!only) return undefined;
  const valid: Category[] = ['skills', 'agents', 'commands'];
  const parsed = only.split(',').map((s) => s.trim().toLowerCase()) as Category[];
  const filtered = parsed.filter((c) => valid.includes(c));
  return filtered.length > 0 ? filtered : undefined;
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      global: { type: 'boolean', short: 'g', default: false },
      project: { type: 'boolean', short: 'p', default: false },
      force: { type: 'boolean', short: 'f', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      only: { type: 'string' },
      opencode: { type: 'boolean', default: false },
      claude: { type: 'boolean', default: false },
      all: { type: 'boolean', short: 'a', default: false },
      skill: { type: 'string', multiple: true },
      agent: { type: 'string', multiple: true },
      command: { type: 'string', multiple: true },
    },
  });

  if (values.help || positionals.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const command = positionals[0];
  const isGlobal = values.global || !values.project;
  const categories = parseCategories(values.only);
  
  // Helper to run install for a specific target
  async function runInstall(target: InstallTarget, showHeader = true): Promise<boolean> {
    const targetName = target === 'claude' ? 'Claude Code' : 'OpenCode';
    
    if (showHeader) {
      console.log(`\nInstalling UX Toolkit to ${targetName} ${isGlobal ? 'globally' : 'in project'}...\n`);
    }

    const result = await install({
      global: isGlobal,
      target,
      force: values.force,
      verbose: values.verbose,
      categories,
      skills: values.skill,
      agents: values.agent,
      commands: values.command,
    });

    if (result.installed.length > 0) {
      console.log(`Installed ${result.installed.length} components:`);
      result.installed.forEach((item) => console.log(`  + ${item}`));
    }

    if (result.skipped.length > 0) {
      console.log(`\nSkipped ${result.skipped.length} (already exist, use --force to overwrite):`);
      result.skipped.forEach((item) => console.log(`  - ${item}`));
    }

    if (result.errors.length > 0) {
      console.error(`\nErrors:`);
      result.errors.forEach((err) => console.error(`  ! ${err}`));
      return false;
    }

    return true;
  }

  switch (command) {
    case 'install': {
      const opencodeInstalled = isOpenCodeInstalled();
      const claudeInstalled = isClaudeInstalled();
      const explicitTarget = values.opencode || values.claude;
      
      // Determine targets to install to
      let targets: InstallTarget[] = [];
      
      if (values.all) {
        // --all flag: install to all detected platforms
        if (opencodeInstalled) targets.push('opencode');
        if (claudeInstalled) targets.push('claude');
        if (targets.length === 0) {
          console.warn('\n⚠️  No platforms detected. Installing to OpenCode by default.\n');
          targets = ['opencode'];
        }
      } else if (explicitTarget) {
        // Explicit target specified
        targets = [values.claude ? 'claude' : 'opencode'];
      } else if (isGlobal && opencodeInstalled && claudeInstalled) {
        // Both platforms detected, prompt user
        console.log('\n🔍 Detected both OpenCode and Claude Code installations.\n');
        const installBoth = await promptYesNo('Install to both platforms?', true);
        
        if (installBoth) {
          targets = ['opencode', 'claude'];
        } else {
          const choice = await prompt('Which platform? (opencode/claude) [opencode]: ');
          targets = [choice === 'claude' ? 'claude' : 'opencode'];
        }
      } else if (isGlobal && claudeInstalled && !opencodeInstalled) {
        // Only Claude detected
        console.log('\n🔍 Detected Claude Code (OpenCode not found).\n');
        targets = ['claude'];
      } else {
        // Default to opencode
        targets = ['opencode'];
      }
      
      // Run installation for each target
      let hasErrors = false;
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        if (i > 0) console.log(''); // Separator between targets
        const success = await runInstall(target);
        if (!success) hasErrors = true;
      }
      
      console.log('\nDone!');
      if (hasErrors) process.exit(1);
      break;
    }

    case 'uninstall': {
      const target: InstallTarget = values.claude ? 'claude' : 'opencode';
      const targetName = target === 'claude' ? 'Claude Code' : 'OpenCode';
      console.log(`\nUninstalling UX Toolkit from ${targetName} ${isGlobal ? 'globally' : 'in project'}...\n`);

      const result = await uninstall({
        global: isGlobal,
        target,
        verbose: values.verbose,
        categories,
      });

      if (result.removed.length > 0) {
        console.log(`Removed ${result.removed.length} components:`);
        result.removed.forEach((item) => console.log(`  - ${item}`));
      }

      if (result.notFound.length > 0 && values.verbose) {
        console.log(`\nNot found (${result.notFound.length}):`);
        result.notFound.forEach((item) => console.log(`  ? ${item}`));
      }

      if (result.errors.length > 0) {
        console.error(`\nErrors:`);
        result.errors.forEach((err) => console.error(`  ! ${err}`));
        process.exit(1);
      }

      console.log('\nDone!');
      break;
    }

    case 'upgrade': {
      const target: InstallTarget = values.claude ? 'claude' : 'opencode';
      const targetName = target === 'claude' ? 'Claude Code' : 'OpenCode';
      console.log(`\nUpgrading UX Toolkit in ${targetName} ${isGlobal ? 'globally' : 'in project'}...\n`);

      const result = await install({
        global: isGlobal,
        target,
        force: true, // Always force for upgrade
        verbose: values.verbose,
        categories,
      });

      if (result.installed.length > 0) {
        console.log(`Upgraded ${result.installed.length} components:`);
        result.installed.forEach((item) => console.log(`  ↑ ${item}`));
      }

      if (result.errors.length > 0) {
        console.error(`\nErrors:`);
        result.errors.forEach((err) => console.error(`  ! ${err}`));
        process.exit(1);
      }

      console.log('\nDone!');
      break;
    }

    case 'status': {
      const status = await getStatus({ global: isGlobal });
      
      console.log('\nUX Toolkit - Installation Status\n');
      
      // Helper to format status line
      const formatStatus = (installed: number, total: number): string => {
        if (installed === 0) return `✗ 0/${total}`;
        if (installed === total) return `✓ ${installed}/${total}`;
        return `◐ ${installed}/${total}`;
      };
      
      // Helper to get missing components
      const getMissing = (components: { name: string; installed: boolean }[]): string[] => {
        return components.filter(c => !c.installed).map(c => c.name);
      };
      
      // OpenCode status
      console.log('  OpenCode:');
      if (!status.opencode.available) {
        console.log('    Not installed (no config directory found)');
      } else {
        console.log(`    Skills:   ${formatStatus(status.opencode.skills.installed, status.opencode.skills.total)}`);
        console.log(`    Agents:   ${formatStatus(status.opencode.agents.installed, status.opencode.agents.total)}`);
        console.log(`    Commands: ${formatStatus(status.opencode.commands.installed, status.opencode.commands.total)}`);
        
        if (values.verbose) {
          const missingSkills = getMissing(status.opencode.skills.components);
          const missingAgents = getMissing(status.opencode.agents.components);
          const missingCommands = getMissing(status.opencode.commands.components);
          
          if (missingSkills.length > 0) {
            console.log(`    Missing skills: ${missingSkills.join(', ')}`);
          }
          if (missingAgents.length > 0) {
            console.log(`    Missing agents: ${missingAgents.join(', ')}`);
          }
          if (missingCommands.length > 0) {
            console.log(`    Missing commands: ${missingCommands.join(', ')}`);
          }
        }
      }
      
      // Claude Code status
      console.log('\n  Claude Code:');
      if (!status.claude.available) {
        console.log('    Not installed (no config directory found)');
      } else {
        console.log(`    Skills:   ${formatStatus(status.claude.skills.installed, status.claude.skills.total)}`);
        console.log(`    Agents:   ${formatStatus(status.claude.agents.installed, status.claude.agents.total)}`);
        console.log(`    Commands: ${formatStatus(status.claude.commands.installed, status.claude.commands.total)}`);
        
        if (values.verbose) {
          const missingSkills = getMissing(status.claude.skills.components);
          const missingAgents = getMissing(status.claude.agents.components);
          const missingCommands = getMissing(status.claude.commands.components);
          
          if (missingSkills.length > 0) {
            console.log(`    Missing skills: ${missingSkills.join(', ')}`);
          }
          if (missingAgents.length > 0) {
            console.log(`    Missing agents: ${missingAgents.join(', ')}`);
          }
          if (missingCommands.length > 0) {
            console.log(`    Missing commands: ${missingCommands.join(', ')}`);
          }
        }
      }
      
      // Summary
      const totalOpencode = status.opencode.skills.installed + status.opencode.agents.installed + status.opencode.commands.installed;
      const totalClaude = status.claude.skills.installed + status.claude.agents.installed + status.claude.commands.installed;
      const totalAvailable = SKILLS.length + AGENTS.length + COMMANDS.length;
      
      console.log('\n  Summary:');
      if (status.opencode.available && totalOpencode === totalAvailable) {
        console.log('    OpenCode:    ✓ Fully installed');
      } else if (status.opencode.available && totalOpencode > 0) {
        console.log(`    OpenCode:    ◐ Partially installed (${totalOpencode}/${totalAvailable})`);
      } else if (status.opencode.available) {
        console.log('    OpenCode:    ✗ Not installed');
      }
      
      if (status.claude.available && totalClaude === totalAvailable) {
        console.log('    Claude Code: ✓ Fully installed');
      } else if (status.claude.available && totalClaude > 0) {
        console.log(`    Claude Code: ◐ Partially installed (${totalClaude}/${totalAvailable})`);
      } else if (status.claude.available) {
        console.log('    Claude Code: ✗ Not installed');
      }
      
      break;
    }

    case 'doctor': {
      console.log('\nUX Toolkit - Diagnostics\n');
      
      const issues: string[] = [];
      const warnings: string[] = [];
      const ok: string[] = [];
      
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
      if (majorVersion < 18) {
        issues.push(`Node.js ${nodeVersion} is below minimum (v18+)`);
      } else {
        ok.push(`Node.js ${nodeVersion}`);
      }
      
      // Check platform detection
      const platformInfo = getPlatformInfo();

      // Import existsSync for directory checks
      const { existsSync } = await import('node:fs');

      // OpenCode checks
      if (platformInfo.opencode.exists) {
        ok.push(`OpenCode detected at ${platformInfo.opencode.configDir}`);

        // Check if skills/agents/commands directories exist
        const skillsDir = safeJoin(platformInfo.opencode.configDir, 'skills');
        const agentsDir = safeJoin(platformInfo.opencode.configDir, 'agents');
        const commandsDir = safeJoin(platformInfo.opencode.configDir, 'commands');
        
        if (!existsSync(skillsDir)) {
          warnings.push('OpenCode skills directory missing');
        }
        if (!existsSync(agentsDir)) {
          warnings.push('OpenCode agents directory missing');
        }
        if (!existsSync(commandsDir)) {
          warnings.push('OpenCode commands directory missing');
        }
      } else {
        warnings.push('OpenCode not detected (config directory not found)');
      }
      
      // Claude Code checks
      if (platformInfo.claude.exists) {
        ok.push(`Claude Code detected at ${platformInfo.claude.configDir}`);

        const skillsDir = safeJoin(platformInfo.claude.configDir, 'skills');
        const agentsDir = safeJoin(platformInfo.claude.configDir, 'agents');
        const commandsDir = safeJoin(platformInfo.claude.configDir, 'commands');
        
        if (!existsSync(skillsDir)) {
          warnings.push('Claude Code skills directory missing');
        }
        if (!existsSync(agentsDir)) {
          warnings.push('Claude Code agents directory missing');
        }
        if (!existsSync(commandsDir)) {
          warnings.push('Claude Code commands directory missing');
        }
      } else {
        warnings.push('Claude Code not detected (config directory not found)');
      }
      
      // Check installation status
      const status = await getStatus({ global: true });
      
      const opencodeTotal = status.opencode.skills.installed + status.opencode.agents.installed + status.opencode.commands.installed;
      const claudeTotal = status.claude.skills.installed + status.claude.agents.installed + status.claude.commands.installed;
      const totalAvailable = SKILLS.length + AGENTS.length + COMMANDS.length;
      
      if (status.opencode.available) {
        if (opencodeTotal === totalAvailable) {
          ok.push('OpenCode: All components installed');
        } else if (opencodeTotal > 0) {
          warnings.push(`OpenCode: Partial installation (${opencodeTotal}/${totalAvailable})`);
        } else {
          warnings.push('OpenCode: No components installed');
        }
      }
      
      if (status.claude.available) {
        if (claudeTotal === totalAvailable) {
          ok.push('Claude Code: All components installed');
        } else if (claudeTotal > 0) {
          warnings.push(`Claude Code: Partial installation (${claudeTotal}/${totalAvailable})`);
        } else {
          warnings.push('Claude Code: No components installed');
        }
      }
      
      // Print results
      if (ok.length > 0) {
        console.log('  ✓ OK:');
        ok.forEach(item => console.log(`    • ${item}`));
      }
      
      if (warnings.length > 0) {
        console.log('\n  ⚠ Warnings:');
        warnings.forEach(item => console.log(`    • ${item}`));
      }
      
      if (issues.length > 0) {
        console.log('\n  ✗ Issues:');
        issues.forEach(item => console.log(`    • ${item}`));
      }
      
      // Summary
      console.log('\n  Summary:');
      if (issues.length === 0 && warnings.length === 0) {
        console.log('    Everything looks good!');
      } else if (issues.length === 0) {
        console.log(`    ${warnings.length} warning(s), no critical issues`);
      } else {
        console.log(`    ${issues.length} issue(s), ${warnings.length} warning(s)`);
      }
      
      // Suggestions
      if (warnings.length > 0 || issues.length > 0) {
        console.log('\n  Suggestions:');
        if (!platformInfo.opencode.exists && !platformInfo.claude.exists) {
          console.log('    • Install OpenCode or Claude Code first');
        }
        if (opencodeTotal < totalAvailable && status.opencode.available) {
          console.log('    • Run: npx ux-toolkit install --opencode --global');
        }
        if (claudeTotal < totalAvailable && status.claude.available) {
          console.log('    • Run: npx ux-toolkit install --claude --global');
        }
      }
      
      break;
    }

    case 'info': {
      const platformInfo = getPlatformInfo();
      
      console.log('\nUX Toolkit - Platform Information\n');
      console.log(`  Platform:       ${platformInfo.platform}`);
      console.log(`  Node Version:   ${process.version}`);
      
      console.log('\n  OpenCode:');
      console.log(`    Config Dir:   ${platformInfo.opencode.configDir}`);
      console.log(`    Installed:    ${platformInfo.opencode.exists ? 'Yes' : 'No'}`);
      
      console.log('\n  Claude Code:');
      console.log(`    Config Dir:   ${platformInfo.claude.configDir}`);
      console.log(`    Installed:    ${platformInfo.claude.exists ? 'Yes' : 'No'}`);
      
      if (process.env.UX_TOOLKIT_CONFIG_DIR || process.env.OPENCODE_CONFIG_DIR || 
          process.env.CLAUDE_CONFIG_DIR || process.env.XDG_CONFIG_HOME) {
        console.log('\n  Environment Overrides:');
        if (process.env.UX_TOOLKIT_CONFIG_DIR) {
          console.log(`    UX_TOOLKIT_CONFIG_DIR: ${process.env.UX_TOOLKIT_CONFIG_DIR}`);
        }
        if (process.env.OPENCODE_CONFIG_DIR) {
          console.log(`    OPENCODE_CONFIG_DIR:   ${process.env.OPENCODE_CONFIG_DIR}`);
        }
        if (process.env.CLAUDE_CONFIG_DIR) {
          console.log(`    CLAUDE_CONFIG_DIR:     ${process.env.CLAUDE_CONFIG_DIR}`);
        }
        if (process.env.XDG_CONFIG_HOME) {
          console.log(`    XDG_CONFIG_HOME:       ${process.env.XDG_CONFIG_HOME}`);
        }
      }
      
      console.log(`\n  Components:`);
      console.log(`    Skills:   ${SKILLS.length}`);
      console.log(`    Agents:   ${AGENTS.length}`);
      console.log(`    Commands: ${COMMANDS.length}`);
      break;
    }

    case 'list': {
      console.log('\nSkills:');
      SKILLS.forEach((s) => console.log(`  ${s.name.padEnd(25)} ${s.description}`));

      console.log('\nAgents:');
      AGENTS.forEach((a) => console.log(`  ${a.name.padEnd(25)} ${a.description}`));

      console.log('\nCommands:');
      COMMANDS.forEach((c) => console.log(`  /${c.name.padEnd(24)} ${c.description}`));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
