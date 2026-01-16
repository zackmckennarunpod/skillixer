/**
 * SKILL.md Parser
 *
 * Parses SKILL.md files into Skill objects.
 */
import YAML from 'yaml';
import type { ParsedSkill } from '../core/types.js';

/**
 * Parse a SKILL.md file content into a structured object
 */
export function parseSkillMd(content: string, sourcePath?: string): ParsedSkill {
  const trimmed = content.trim();

  // Check for frontmatter
  if (!trimmed.startsWith('---')) {
    // No frontmatter - treat entire content as instructions
    return {
      frontmatter: {},
      name: extractNameFromPath(sourcePath) ?? 'unnamed-skill',
      instructions: trimmed,
      rawContent: content,
    };
  }

  // Find the end of frontmatter
  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    throw new Error(`Invalid SKILL.md: frontmatter not closed in ${sourcePath ?? 'unknown'}`);
  }

  // Parse frontmatter
  const frontmatterStr = trimmed.slice(3, endIndex).trim();
  let frontmatter: Record<string, unknown>;
  try {
    frontmatter = YAML.parse(frontmatterStr) ?? {};
  } catch (e) {
    throw new Error(
      `Invalid YAML frontmatter in ${sourcePath ?? 'unknown'}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  // Extract body (everything after frontmatter)
  const body = trimmed.slice(endIndex + 3).trim();

  // Get name from frontmatter or path
  const name =
    typeof frontmatter.name === 'string'
      ? frontmatter.name
      : extractNameFromPath(sourcePath) ?? 'unnamed-skill';

  // Get description from frontmatter
  const description =
    typeof frontmatter.description === 'string' ? frontmatter.description : undefined;

  return {
    frontmatter,
    name,
    description,
    instructions: body,
    rawContent: content,
  };
}

function extractNameFromPath(path?: string): string | undefined {
  if (!path) return undefined;

  // Handle both /path/to/skill.md and /path/to/SKILL.md
  const filename = path.split('/').pop();
  if (!filename) return undefined;

  // Remove .md extension and SKILL. prefix if present
  return filename
    .replace(/\.md$/i, '')
    .replace(/^SKILL\./i, '')
    .replace(/^skill\./i, '');
}
