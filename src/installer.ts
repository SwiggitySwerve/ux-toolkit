import { existsSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { getPackageRoot, getDestinationPaths } from './paths.js';

export interface InstallOptions {
  /** Install globally to ~/.config/opencode */
  global?: boolean;
  /** Project root for local installation */
  projectRoot?: string;
  /** Only install specific categories */
  categories?: ('skills' | 'agents' | 'commands')[];
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
    categories = ['skills', 'agents', 'commands'],
    force = false,
    verbose = false,
  } = options;

  const result: InstallResult = {
    installed: [],
    skipped: [],
    errors: [],
  };

  const packageRoot = getPackageRoot();
  const destinations = getDestinationPaths(isGlobal, projectRoot);

  const log = (msg: string) => {
    if (verbose) console.log(msg);
  };

  if (categories.includes('skills')) {
    const skillsDir = join(packageRoot, 'skills');
    if (existsSync(skillsDir)) {
      const skills = readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

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

  if (categories.includes('agents')) {
    const agentsDir = join(packageRoot, 'agents');
    if (existsSync(agentsDir)) {
      const agents = readdirSync(agentsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));

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

  if (categories.includes('commands')) {
    const commandsDir = join(packageRoot, 'commands');
    if (existsSync(commandsDir)) {
      const commands = readdirSync(commandsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace('.md', ''));

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
