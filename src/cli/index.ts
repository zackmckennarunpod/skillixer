#!/usr/bin/env bun
/**
 * Skillixer CLI
 *
 * Build commands for composing and compiling skills.
 */
import { parseArgs } from 'node:util';
import { buildCommand } from './build.js';
import { addCommand } from './add.js';
import { watchCommand } from './watch.js';
import { runWizard } from './wizard.js';

const HELP = `
skillixer - Compose and compile agent skills

USAGE:
  skillixer <command> [options]

COMMANDS:
  build <file.forge.ts>    Compile a composition to SKILL.md
  preview <file.forge.ts>  Preview what would be compiled (dry-run)
  watch <file.forge.ts>    Watch and rebuild on changes
  wizard                   Interactive skill composition helper
  add <source>             Install a skill from git/GitHub

OPTIONS:
  -o, --out <dir>          Output directory (default: ./skills)
  -n, --name <name>        Override skill name
  -d, --description <desc> Set skill description
  --dry-run                Show output without writing files
  -h, --help               Show this help message

EXAMPLES:
  skillixer build incident-response.forge.ts
  skillixer build incident-response.forge.ts -o ./compiled
  skillixer preview incident-response.forge.ts
  skillixer watch incident-response.forge.ts
  skillixer wizard
  skillixer add github:anthropics/skills/datadog-search.md

COMPOSITION FILE FORMAT:
  A .forge.ts file exports a composition as default:

  import { skill, pipe, parallel, fork, hydrate } from 'skillixer';

  const search = skill({
    name: 'search',
    instructions: 'Search for relevant information...'
  });

  export default pipe(
    parallel(datadogSearch, githubSearch),
    summarize,
    fork({
      when: 'severity === "critical"',
      then: alertOncall,
      else: logFinding
    })
  );
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      out: { type: 'string', short: 'o', default: './skills' },
      name: { type: 'string', short: 'n' },
      description: { type: 'string', short: 'd' },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  if (values.help || positionals.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  const [command, ...args] = positionals;

  try {
    switch (command) {
      case 'build':
        await buildCommand(args[0], {
          outDir: values.out!,
          name: values.name,
          description: values.description,
          dryRun: values['dry-run']!,
        });
        break;

      case 'preview':
        await buildCommand(args[0], {
          outDir: values.out!,
          name: values.name,
          description: values.description,
          dryRun: true,
        });
        break;

      case 'watch':
        await watchCommand(args[0], {
          outDir: values.out!,
          name: values.name,
          description: values.description,
        });
        break;

      case 'wizard':
        await runWizard({
          outputPath: args[0],
        });
        break;

      case 'add':
        await addCommand(args[0], {
          outDir: values.out!,
        });
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
