import { existsSync, mkdirSync, cpSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { getPackageRoot, getDestinationPaths, isOpenCodeInstalled, isClaudeInstalled, type InstallTarget } from './paths.js';
import { SKILLS, AGENTS, COMMANDS } from './manifest.js';

export interface InstallOptions {
  /** Install globally to config directory */
  global?: boolean;
  /** Project root for local installation */
  projectRoot?: string;
  /** Target platform: 'opencode' or 'claude' */
  target?: InstallTarget;
  /** Only install specific categories */
  categories?: ('skills' | 'agents' | 'commands')[];
  /** Specific skills to install (by name) */
  skills?: string[];
  /** Specific agents to install (by name) */
  agents?: string[];
  /** Specific commands to install (by name) */
  commands?: string[];
  /** Overwrite existing files */
  force?: boolean;
  /** Verbose output */
  verbose?: boolean;
}

export interface InstallResult {
  installed: string[];
  skipped: string[];
  errors: string[];
}

export async function install(options: InstallOptions = {}): Promise<InstallResult> {
  const {
    global: isGlobal = false,
    projectRoot = process.cwd(),
    target = 'opencode',
    categories = ['skills', 'agents', 'commands'],
    skills: specificSkills,
    agents: specificAgents,
    commands: specificCommands,
    force = false,
    verbose = false,
  } = options;
  
  // If specific components are requested, filter to only those categories
  const hasSpecificComponents = specificSkills?.length || specificAgents?.length || specificCommands?.length;
  const effectiveCategories = hasSpecificComponents 
    ? categories.filter(cat => {
        if (cat === 'skills' && specificSkills?.length) return true;
        if (cat === 'agents' && specificAgents?.length) return true;
        if (cat === 'commands' && specificCommands?.length) return true;
        return false;
      })
    : categories;

  const result: InstallResult = {
    installed: [],
    skipped: [],
    errors: [],
  };

  const packageRoot = getPackageRoot();
  const destinations = getDestinationPaths(isGlobal, projectRoot, target);

  const log = (msg: string) => {
    if (verbose) console.log(msg);
  };

  if (effectiveCategories.includes('skills')) {
    const skillsDir = join(packageRoot, 'skills');
    if (existsSync(skillsDir)) {
      let skills = readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
      
      // Filter to specific skills if requested
      if (specificSkills?.length) {
        const requested = new Set(specificSkills.map(s => s.toLowerCase()));
        skills = skills.filter(s => requested.has(s.toLowerCase()));
      }

      for (const skill of skills) {
        const src = join(skillsDir, skill);
        const dest = join(destinations.skills, skill);

        try {
          if (existsSync(dest) && !force) {
            result.skipped.push(`skill:${skill}`);
            log(`Skipped skill/${skill} (already exists)`);
            continue;
          }

          mkdirSync(dirname(dest), { recursive: true });
          cpSync(src, dest, { recursive: true });
          result.installed.push(`skill:${skill}`);
          log(`Installed skill/${skill}`);
        } catch (err) {
          result.errors.push(`skill:${skill}: ${err}`);
        }
      }
    }
  }

  if (effectiveCategories.includes('agents')) {
    const agentsDir = join(packageRoot, 'agents');
    if (existsSync(agentsDir)) {
      let agents = readdirSync(agentsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));
      
      // Filter to specific agents if requested
      if (specificAgents?.length) {
        const requested = new Set(specificAgents.map(a => a.toLowerCase()));
        agents = agents.filter(a => requested.has(a.toLowerCase()));
      }

      for (const agent of agents) {
        const src = join(agentsDir, `${agent}.md`);
        const dest = join(destinations.agents, `${agent}.md`);

        try {
          if (existsSync(dest) && !force) {
            result.skipped.push(`agent:${agent}`);
            log(`Skipped agents/${agent}.md (already exists)`);
            continue;
          }

          mkdirSync(dirname(dest), { recursive: true });
          cpSync(src, dest);
          result.installed.push(`agent:${agent}`);
          log(`Installed agents/${agent}.md`);
        } catch (err) {
          result.errors.push(`agent:${agent}: ${err}`);
        }
      }
    }
  }

  if (effectiveCategories.includes('commands')) {
    const commandsDir = join(packageRoot, 'commands');
    if (existsSync(commandsDir)) {
      let commands = readdirSync(commandsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));
      
      // Filter to specific commands if requested
      if (specificCommands?.length) {
        const requested = new Set(specificCommands.map(c => c.toLowerCase()));
        commands = commands.filter(c => requested.has(c.toLowerCase()));
      }

      for (const command of commands) {
        const src = join(commandsDir, `${command}.md`);
        const dest = join(destinations.commands, `${command}.md`);

        try {
          if (existsSync(dest) && !force) {
            result.skipped.push(`command:${command}`);
            log(`Skipped commands/${command}.md (already exists)`);
            continue;
          }

          mkdirSync(dirname(dest), { recursive: true });
          cpSync(src, dest);
          result.installed.push(`command:${command}`);
          log(`Installed commands/${command}.md`);
        } catch (err) {
          result.errors.push(`command:${command}: ${err}`);
        }
      }
    }
  }

  return result;
}

// ============================================================================
// Status checking
// ============================================================================

export interface ComponentStatus {
  name: string;
  installed: boolean;
  path?: string;
  modifiedAt?: Date;
}

export interface CategoryStatus {
  installed: number;
  total: number;
  components: ComponentStatus[];
}

export interface TargetStatus {
  target: InstallTarget;
  available: boolean;
  configDir: string;
  skills: CategoryStatus;
  agents: CategoryStatus;
  commands: CategoryStatus;
}

export interface StatusOptions {
  /** Check global installation */
  global?: boolean;
  /** Project root for local check */
  projectRoot?: string;
}

export interface StatusResult {
  opencode: TargetStatus;
  claude: TargetStatus;
}

function checkComponentStatus(
  componentPath: string,
  name: string
): ComponentStatus {
  const installed = existsSync(componentPath);
  if (!installed) {
    return { name, installed: false };
  }
  
  try {
    const stats = statSync(componentPath);
    return {
      name,
      installed: true,
      path: componentPath,
      modifiedAt: stats.mtime,
    };
  } catch {
    return { name, installed: true, path: componentPath };
  }
}

function getTargetStatus(
  target: InstallTarget,
  isGlobal: boolean,
  projectRoot?: string
): TargetStatus {
  const available = target === 'opencode' ? isOpenCodeInstalled() : isClaudeInstalled();
  const destinations = getDestinationPaths(isGlobal, projectRoot, target);
  
  // Check skills
  const skillStatuses = SKILLS.map((s) => 
    checkComponentStatus(join(destinations.skills, s.name), s.name)
  );
  
  // Check agents
  const agentStatuses = AGENTS.map((a) =>
    checkComponentStatus(join(destinations.agents, `${a.name}.md`), a.name)
  );
  
  // Check commands
  const commandStatuses = COMMANDS.map((c) =>
    checkComponentStatus(join(destinations.commands, `${c.name}.md`), c.name)
  );
  
  return {
    target,
    available,
    configDir: target === 'opencode' 
      ? (isGlobal ? destinations.skills.replace(/[/\\]skills$/, '') : destinations.skills.replace(/[/\\]skills$/, ''))
      : (isGlobal ? destinations.skills.replace(/[/\\]skills$/, '') : destinations.skills.replace(/[/\\]skills$/, '')),
    skills: {
      installed: skillStatuses.filter((s) => s.installed).length,
      total: SKILLS.length,
      components: skillStatuses,
    },
    agents: {
      installed: agentStatuses.filter((a) => a.installed).length,
      total: AGENTS.length,
      components: agentStatuses,
    },
    commands: {
      installed: commandStatuses.filter((c) => c.installed).length,
      total: COMMANDS.length,
      components: commandStatuses,
    },
  };
}

export async function getStatus(options: StatusOptions = {}): Promise<StatusResult> {
  const { global: isGlobal = true, projectRoot = process.cwd() } = options;
  
  return {
    opencode: getTargetStatus('opencode', isGlobal, projectRoot),
    claude: getTargetStatus('claude', isGlobal, projectRoot),
  };
}

// ============================================================================
// Uninstall
// ============================================================================

export interface UninstallOptions {
  /** Uninstall from global config directory */
  global?: boolean;
  /** Project root for local uninstallation */
  projectRoot?: string;
  /** Target platform: 'opencode' or 'claude' */
  target?: InstallTarget;
  /** Only uninstall specific categories */
  categories?: ('skills' | 'agents' | 'commands')[];
  /** Verbose output */
  verbose?: boolean;
}

export interface UninstallResult {
  removed: string[];
  notFound: string[];
  errors: string[];
}

export async function uninstall(options: UninstallOptions = {}): Promise<UninstallResult> {
  const {
    global: isGlobal = false,
    projectRoot = process.cwd(),
    target = 'opencode',
    categories = ['skills', 'agents', 'commands'],
    verbose = false,
  } = options;

  const result: UninstallResult = {
    removed: [],
    notFound: [],
    errors: [],
  };

  const destinations = getDestinationPaths(isGlobal, projectRoot, target);

  const log = (msg: string) => {
    if (verbose) console.log(msg);
  };

  // Get list of our components from manifest
  const ourSkills = SKILLS.map((s) => s.name);
  const ourAgents = AGENTS.map((a) => a.name);
  const ourCommands = COMMANDS.map((c) => c.name);

  if (categories.includes('skills')) {
    for (const skill of ourSkills) {
      const dest = join(destinations.skills, skill);

      try {
        if (!existsSync(dest)) {
          result.notFound.push(`skill:${skill}`);
          log(`Not found: skill/${skill}`);
          continue;
        }

        rmSync(dest, { recursive: true, force: true });
        result.removed.push(`skill:${skill}`);
        log(`Removed skill/${skill}`);
      } catch (err) {
        result.errors.push(`skill:${skill}: ${err}`);
      }
    }
  }

  if (categories.includes('agents')) {
    for (const agent of ourAgents) {
      const dest = join(destinations.agents, `${agent}.md`);

      try {
        if (!existsSync(dest)) {
          result.notFound.push(`agent:${agent}`);
          log(`Not found: agents/${agent}.md`);
          continue;
        }

        rmSync(dest, { force: true });
        result.removed.push(`agent:${agent}`);
        log(`Removed agents/${agent}.md`);
      } catch (err) {
        result.errors.push(`agent:${agent}: ${err}`);
      }
    }
  }

  if (categories.includes('commands')) {
    for (const command of ourCommands) {
      const dest = join(destinations.commands, `${command}.md`);

      try {
        if (!existsSync(dest)) {
          result.notFound.push(`command:${command}`);
          log(`Not found: commands/${command}.md`);
          continue;
        }

        rmSync(dest, { force: true });
        result.removed.push(`command:${command}`);
        log(`Removed commands/${command}.md`);
      } catch (err) {
        result.errors.push(`command:${command}: ${err}`);
      }
    }
  }

  return result;
}
