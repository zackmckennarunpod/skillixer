/**
 * Git Resolver
 *
 * Resolves skills from arbitrary git repositories.
 * Clones/fetches repos and extracts SKILL.md files.
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Skill, SkillNode } from '../core/types.js';
import { parseSkillMd } from './parse.js';

const execAsync = promisify(exec);

/** Cache directory for cloned repos */
const CACHE_DIR = join(homedir(), '.skillixer', 'cache', 'git');

export interface GitSource {
  url: string;
  path: string;
  ref?: string; // branch, tag, or commit
}

/**
 * Parse a git skill reference
 *
 * Formats:
 * - git:https://github.com/org/repo.git/path/to/skill.md
 * - git:https://github.com/org/repo.git/path/to/skill.md@ref
 * - git:git@github.com:org/repo.git/path/to/skill.md
 */
export function parseGitRef(ref: string): GitSource {
  // Remove git: prefix if present
  let cleaned = ref.replace(/^git:/, '');

  // Check for ref (branch/tag/commit)
  const atIndex = cleaned.lastIndexOf('@');
  let refPart: string | undefined;

  if (atIndex !== -1 && !cleaned.slice(0, atIndex).includes('@')) {
    // Only treat as ref if @ is after the URL part
    refPart = cleaned.slice(atIndex + 1);
    cleaned = cleaned.slice(0, atIndex);
  }

  // Find where the repo URL ends and path begins
  // Look for .git/ or first path after domain
  let url: string;
  let path: string;

  const gitIndex = cleaned.indexOf('.git/');
  if (gitIndex !== -1) {
    url = cleaned.slice(0, gitIndex + 4); // Include .git
    path = cleaned.slice(gitIndex + 5); // Skip .git/
  } else {
    // Try to find path separator after domain
    // For URLs like https://github.com/org/repo/path/file.md
    const match = cleaned.match(/^(https?:\/\/[^\/]+\/[^\/]+\/[^\/]+)\/(.+)$/);
    if (match) {
      url = match[1]!;
      path = match[2]!;
    } else {
      throw new Error(`Invalid git reference: ${ref}. Expected format: git:url/path`);
    }
  }

  return { url, path, ref: refPart };
}

/**
 * Get cache path for a git repo
 */
function getRepoCachePath(url: string): string {
  // Convert URL to safe directory name
  const safeName = url
    .replace(/^https?:\/\//, '')
    .replace(/^git@/, '')
    .replace(/:/g, '/')
    .replace(/\.git$/, '')
    .replace(/[^a-zA-Z0-9\-_\/]/g, '_');

  return join(CACHE_DIR, safeName);
}

/**
 * Check if repo cache is fresh (less than 1 hour old)
 */
async function isRepoCacheFresh(repoPath: string): Promise<boolean> {
  try {
    const gitDir = join(repoPath, '.git');
    const stats = await stat(gitDir);
    const age = Date.now() - stats.mtimeMs;
    const oneHour = 60 * 60 * 1000;
    return age < oneHour;
  } catch {
    return false;
  }
}

/**
 * Clone or fetch a git repository
 */
async function ensureRepo(url: string, ref?: string): Promise<string> {
  const repoPath = getRepoCachePath(url);

  if (await isRepoCacheFresh(repoPath)) {
    // Cache is fresh, just checkout the ref if specified
    if (ref) {
      await execAsync(`git checkout ${ref}`, { cwd: repoPath });
    }
    return repoPath;
  }

  // Check if repo exists
  try {
    await stat(join(repoPath, '.git'));
    // Repo exists, fetch updates
    await execAsync('git fetch --all', { cwd: repoPath });
    if (ref) {
      await execAsync(`git checkout ${ref}`, { cwd: repoPath });
    } else {
      await execAsync('git checkout origin/HEAD', { cwd: repoPath });
    }
  } catch {
    // Repo doesn't exist, clone it
    await mkdir(repoPath, { recursive: true });
    await rm(repoPath, { recursive: true, force: true });

    const cloneCmd = ref
      ? `git clone --depth 1 --branch ${ref} ${url} ${repoPath}`
      : `git clone --depth 1 ${url} ${repoPath}`;

    try {
      await execAsync(cloneCmd);
    } catch {
      // If shallow clone with branch fails, try full clone
      await execAsync(`git clone ${url} ${repoPath}`);
      if (ref) {
        await execAsync(`git checkout ${ref}`, { cwd: repoPath });
      }
    }
  }

  return repoPath;
}

/**
 * Resolve a skill from a git repository
 */
export async function resolveGit(source: GitSource): Promise<Skill> {
  // Clone/fetch the repo
  const repoPath = await ensureRepo(source.url, source.ref);

  // Read the skill file
  const skillPath = join(repoPath, source.path);
  let content: string;

  try {
    content = await readFile(skillPath, 'utf-8');
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
      throw new Error(`Skill not found in repo: ${source.path}`);
    }
    throw e;
  }

  const parsed = parseSkillMd(content, `git:${source.url}/${source.path}`);

  return {
    _tag: 'Skill',
    name: parsed.name,
    description: parsed.description,
    instructions: parsed.instructions,
    source: { type: 'git', url: source.url, path: source.path },
    metadata: parsed.frontmatter,
  };
}

/**
 * Import a skill from a git repo as a SkillNode
 *
 * @example
 * ```typescript
 * import { importGit, pipe } from 'skillixer';
 *
 * const mySkill = await importGit('git:https://github.com/org/repo.git/skills/my-skill.md');
 *
 * export default pipe(mySkill, anotherSkill);
 * ```
 */
export async function importGit(ref: string): Promise<SkillNode> {
  const source = parseGitRef(ref);
  const skill = await resolveGit(source);
  return {
    _tag: 'SkillNode',
    skill,
  };
}

/**
 * Clear the git cache
 */
export async function clearGitCache(): Promise<void> {
  await rm(CACHE_DIR, { recursive: true, force: true });
}
