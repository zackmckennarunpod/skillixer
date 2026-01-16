/**
 * GitHub Resolver
 *
 * Resolves skills from GitHub repositories.
 * Uses the gh CLI for authentication when available.
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Skill, SkillNode } from '../core/types.js';
import { parseSkillMd } from './parse.js';

const execAsync = promisify(exec);

/** Cache directory for downloaded skills */
const CACHE_DIR = join(homedir(), '.skillforge', 'cache', 'github');

export interface GitHubSource {
  owner: string;
  repo: string;
  path: string;
  ref?: string; // branch, tag, or commit
}

/**
 * Parse a GitHub skill reference
 *
 * Formats:
 * - github:owner/repo/path/to/skill.md
 * - github:owner/repo/path/to/skill.md@ref
 */
export function parseGitHubRef(ref: string): GitHubSource {
  // Remove github: prefix if present
  const cleaned = ref.replace(/^github:/, '');

  // Check for ref (branch/tag)
  const atIndex = cleaned.lastIndexOf('@');
  let pathPart = cleaned;
  let refPart: string | undefined;

  if (atIndex !== -1) {
    pathPart = cleaned.slice(0, atIndex);
    refPart = cleaned.slice(atIndex + 1);
  }

  const parts = pathPart.split('/');
  if (parts.length < 3) {
    throw new Error(`Invalid GitHub reference: ${ref}. Expected format: owner/repo/path`);
  }

  const [owner, repo, ...pathParts] = parts;

  // TypeScript doesn't know these are defined after the length check
  if (!owner || !repo) {
    throw new Error(`Invalid GitHub reference: ${ref}. Expected format: owner/repo/path`);
  }

  return {
    owner,
    repo,
    path: pathParts.join('/'),
    ref: refPart,
  };
}

/**
 * Get cache path for a GitHub skill
 */
function getCachePath(source: GitHubSource): string {
  const ref = source.ref ?? 'HEAD';
  return join(CACHE_DIR, source.owner, source.repo, ref, source.path);
}

/**
 * Check if cached version exists and is fresh (less than 1 hour old)
 */
async function isCacheFresh(cachePath: string): Promise<boolean> {
  try {
    const stats = await stat(cachePath);
    const age = Date.now() - stats.mtimeMs;
    const oneHour = 60 * 60 * 1000;
    return age < oneHour;
  } catch {
    return false;
  }
}

/**
 * Fetch content from GitHub using gh CLI
 */
async function fetchFromGitHub(source: GitHubSource): Promise<string> {
  const ref = source.ref ?? 'HEAD';
  const { owner, repo, path } = source;

  try {
    // Use gh api to fetch raw content
    const { stdout } = await execAsync(
      `gh api repos/${owner}/${repo}/contents/${path}?ref=${ref} --jq '.content' | base64 -d`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );
    return stdout;
  } catch (e) {
    // Fallback to raw URL if gh cli not available or fails
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (fetchError) {
      throw new Error(
        `Failed to fetch skill from GitHub: ${owner}/${repo}/${path}@${ref}. ` +
          `Ensure gh CLI is authenticated or the repo is public.`
      );
    }
  }
}

/**
 * Resolve a skill from GitHub
 */
export async function resolveGitHub(source: GitHubSource): Promise<Skill> {
  const cachePath = getCachePath(source);

  // Check cache first
  if (await isCacheFresh(cachePath)) {
    const content = await readFile(cachePath, 'utf-8');
    const parsed = parseSkillMd(content, `github:${source.owner}/${source.repo}/${source.path}`);
    return {
      _tag: 'Skill',
      name: parsed.name,
      description: parsed.description,
      instructions: parsed.instructions,
      source: { type: 'github', owner: source.owner, repo: source.repo, path: source.path },
      metadata: parsed.frontmatter,
    };
  }

  // Fetch from GitHub
  const content = await fetchFromGitHub(source);

  // Cache it
  await mkdir(join(cachePath, '..'), { recursive: true });
  await writeFile(cachePath, content, 'utf-8');

  const parsed = parseSkillMd(content, `github:${source.owner}/${source.repo}/${source.path}`);

  return {
    _tag: 'Skill',
    name: parsed.name,
    description: parsed.description,
    instructions: parsed.instructions,
    source: { type: 'github', owner: source.owner, repo: source.repo, path: source.path },
    metadata: parsed.frontmatter,
  };
}

/**
 * Import a skill from GitHub as a SkillNode
 *
 * @example
 * ```typescript
 * import { importGitHub, pipe } from 'skillforge';
 *
 * const datadogSearch = await importGitHub('anthropics/skills/datadog/search.md');
 *
 * export default pipe(
 *   datadogSearch,
 *   summarize
 * );
 * ```
 */
export async function importGitHub(ref: string): Promise<SkillNode> {
  const source = parseGitHubRef(ref);
  const skill = await resolveGitHub(source);
  return {
    _tag: 'SkillNode',
    skill,
  };
}

/**
 * Clear the GitHub cache
 */
export async function clearCache(): Promise<void> {
  const { rm } = await import('node:fs/promises');
  await rm(CACHE_DIR, { recursive: true, force: true });
}
