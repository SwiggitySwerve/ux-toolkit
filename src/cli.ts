#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { install } from './installer.js';
import { SKILLS, AGENTS, COMMANDS } from './manifest.js';

const HELP = `
ux-toolkit - AI-powered UI/UX review toolkit

USAGE:
  npx ux-toolkit <command> [options]

COMMANDS:
  install     Install skills, agents, and commands
  list        List available components

OPTIONS:
  --global, -g      Install to global config (~/.config/opencode)
  --project, -p     Install to project config (.opencode/)
  --force, -f       Overwrite existing files
  --verbose, -v     Verbose output
  --help, -h        Show this help

EXAMPLES:
  npx ux-toolkit install --global
  npx ux-toolkit install --project --force
  npx ux-toolkit list
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      global: { type: 'boolean', short: 'g', default: false },
      project: { type: 'boolean', short: 'p', default: false },
      force: { type: 'boolean', short: 'f', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help || positionals.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const command = positionals[0];

  switch (command) {
    case 'install': {
      const isGlobal = values.global || !values.project;

      console.log(`\nInstalling UX Toolkit ${isGlobal ? 'globally' : 'to project'}...\n`);

      const result = await install({
        global: isGlobal,
        force: values.force,
        verbose: values.verbose,
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
        process.exit(1);
      }

      console.log('\nDone!');
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
