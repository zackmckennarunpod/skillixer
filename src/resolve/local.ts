/**
 * Local Resolver
 *
 * Resolves skills from local filesystem paths.
 */
import { readFile } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import type { Skill, SkillNode } from '../core/types.js';
import { parseSkillMd } from './parse.js';

/**
 * Resolve a skill from a local file path
 *
 * @param path - Path to SKILL.md file (relative or absolute)
 * @param basePath - Base path for relative paths (defaults to cwd)
 */
export async function resolveLocal(path: string, basePath?: string): Promise<Skill> {
  const absolutePath = isAbsolute(path) ? path : resolve(basePath ?? process.cwd(), path);

  let content: string;
  try {
    content = await readFile(absolutePath, 'utf-8');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
      throw new Error(`Skill not found: ${absolutePath}`);
    }
    throw e;
  }

  const parsed = parseSkillMd(content, absolutePath);

  return {
    _tag: 'Skill',
    name: parsed.name,
    description: parsed.description,
    instructions: parsed.instructions,
    source: { type: 'local', path: absolutePath },
    metadata: parsed.frontmatter,
  };
}

/**
 * Import a local skill as a SkillNode for composition
 *
 * @example
 * ```typescript
 * import { importLocal, pipe } from 'skillforge';
 *
 * const datadogSearch = await importLocal('./skills/datadog-search.md');
 *
 * export default pipe(
 *   datadogSearch,
 *   summarize
 * );
 * ```
 */
export async function importLocal(path: string, basePath?: string): Promise<SkillNode> {
  const skill = await resolveLocal(path, basePath);
  return {
    _tag: 'SkillNode',
    skill,
  };
}
