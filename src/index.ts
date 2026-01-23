export { install, uninstall, getStatus } from './installer.js';
export type { 
  InstallOptions, 
  UninstallOptions, 
  InstallResult, 
  UninstallResult,
  StatusOptions,
  StatusResult,
  TargetStatus,
  CategoryStatus,
  ComponentStatus,
} from './installer.js';
export { 
  getSkillPath, 
  getAgentPath, 
  getCommandPath,
  getGlobalConfigDir,
  getClaudeConfigDir,
  getProjectConfigDir,
  getDestinationPaths,
  isOpenCodeInstalled,
  isClaudeInstalled,
  getPlatformInfo,
} from './paths.js';
export type { InstallTarget, DestinationPathsOptions } from './paths.js';
export { SKILLS, AGENTS, COMMANDS } from './manifest.js';
