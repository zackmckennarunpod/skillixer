/**
 * Build command - compiles a .forge.ts file to SKILL.md
 */
import { resolve, basename, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import type { CompositionNode } from '../core/types.js';
import { compileWithAgent, previewCompilation } from '../compiler/index.js';

export interface BuildOptions {
  outDir: string;
  name?: string;
  description?: string;
  dryRun: boolean;
}

export async function buildCommand(
  forgeFile: string | undefined,
  options: BuildOptions
): Promise<void> {
  if (!forgeFile) {
    throw new Error('No forge file specified. Usage: skillforge build <file.forge.ts>');
  }

  // Resolve the path
  const absolutePath = resolve(process.cwd(), forgeFile);
  console.log(`📦 Loading composition from: ${absolutePath}`);

  // Import the forge file
  let composition: CompositionNode;
  try {
    const module = await import(absolutePath);
    composition = module.default;

    if (!composition || !composition._tag) {
      throw new Error('Forge file must export a composition as default');
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('Cannot find module')) {
      throw new Error(`Forge file not found: ${absolutePath}`);
    }
    throw e;
  }

  // Determine the skill name
  const skillName = options.name ?? basename(forgeFile, '.forge.ts');

  if (options.dryRun) {
    // Just show what would be compiled
    console.log('\n📋 Composition preview:\n');
    const preview = previewCompilation(composition, {
      name: skillName,
      description: options.description,
    });
    console.log(preview);
    console.log('\n(Dry run - no files written. Remove --dry-run to compile.)');
    return;
  }

  // Compile with the agent
  console.log('🤖 Compiling with agent...');
  const result = await compileWithAgent(composition, {
    name: skillName,
    description: options.description,
  });

  // Write the output
  const outDir = resolve(process.cwd(), options.outDir);
  await mkdir(outDir, { recursive: true });

  const outFile = join(outDir, `${skillName}.md`);
  await writeFile(outFile, result.content, 'utf-8');

  console.log(`\n✅ Compiled skill written to: ${outFile}`);
  console.log(`\n📊 Compilation stats:`);
  console.log(`   - Model: ${result.metadata.model}`);
  console.log(`   - Skills composed: ${result.metadata.skillCount}`);
  console.log(`   - Patterns used: ${result.metadata.patterns.join(', ') || 'simple'}`);
  console.log(`   - Tokens: ${result.metadata.inputTokens} in / ${result.metadata.outputTokens} out`);
}
