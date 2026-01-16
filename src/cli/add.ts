/**
 * Add command - installs a skill from GitHub
 */
import { resolve, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolveGitHub, parseGitHubRef } from '../resolve/github.js';

export interface AddOptions {
  outDir: string;
}

export async function addCommand(source: string | undefined, options: AddOptions): Promise<void> {
  if (!source) {
    throw new Error('No source specified. Usage: skillforge add <github:owner/repo/path>');
  }

  // Parse the source
  if (!source.startsWith('github:') && !source.includes('/')) {
    throw new Error(
      `Invalid source: ${source}. Expected format: github:owner/repo/path or owner/repo/path`
    );
  }

  const ref = source.startsWith('github:') ? source : `github:${source}`;
  const ghSource = parseGitHubRef(ref);

  console.log(`📥 Fetching skill from: ${ghSource.owner}/${ghSource.repo}/${ghSource.path}`);

  // Resolve the skill
  const skill = await resolveGitHub(ghSource);

  // Write to output directory
  const outDir = resolve(process.cwd(), options.outDir);
  await mkdir(outDir, { recursive: true });

  // Reconstruct the SKILL.md content
  const content = reconstructSkillMd(skill);
  const outFile = join(outDir, `${skill.name}.md`);

  await writeFile(outFile, content, 'utf-8');

  console.log(`\n✅ Skill installed: ${outFile}`);
  console.log(`   - Name: ${skill.name}`);
  if (skill.description) {
    console.log(`   - Description: ${skill.description}`);
  }

  console.log(`\n📝 Usage in a .forge.ts file:`);
  console.log(`   import { importLocal, pipe } from 'skillforge';`);
  console.log(`   const ${camelCase(skill.name)} = await importLocal('./${options.outDir}/${skill.name}.md');`);
}

function reconstructSkillMd(skill: {
  name: string;
  description?: string;
  instructions: string;
  metadata?: Record<string, unknown>;
}): string {
  const frontmatter: Record<string, unknown> = {
    name: skill.name,
    ...skill.metadata,
  };

  if (skill.description) {
    frontmatter.description = skill.description;
  }

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `---\n${yaml}\n---\n\n${skill.instructions}`;
}

function camelCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}
