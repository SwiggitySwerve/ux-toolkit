import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getPackageRoot(): string {
  return join(__dirname, '..');
}

export function getSkillPath(skillName: string): string {
  return join(getPackageRoot(), 'skills', skillName, 'SKILL.md');
}

export function getAgentPath(agentName: string): string {
  return join(getPackageRoot(), 'agents', `${agentName}.md`);
}

export function getCommandPath(commandName: string): string {
  return join(getPackageRoot(), 'commands', `${commandName}.md`);
}

export function getGlobalConfigDir(): string {
  return join(homedir(), '.config', 'opencode');
}

export function getProjectConfigDir(projectRoot: string = process.cwd()): string {
  return join(projectRoot, '.opencode');
}

export function getDestinationPaths(global: boolean, projectRoot?: string) {
  const baseDir = global ? getGlobalConfigDir() : getProjectConfigDir(projectRoot);

  return {
    skills: join(baseDir, 'skills'),
    agents: join(baseDir, 'agents'),
    commands: join(baseDir, 'commands'),
  };
}
