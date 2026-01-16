/**
 * skill() - Define a skill inline
 * 
 * Creates a Skill from inline definition. This is the leaf node
 * of the composition tree.
 */
import type { Skill, SkillNode } from './types.js';

export interface SkillDefinition {
  readonly name: string;
  readonly description?: string;
  readonly instructions: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Create an inline skill definition
 * 
 * @example
 * ```typescript
 * const summarize = skill({
 *   name: 'summarize',
 *   description: 'Summarize findings',
 *   instructions: `
 *     Analyze the provided context.
 *     Create a concise summary.
 *   `
 * });
 * ```
 */
export function skill(definition: SkillDefinition): SkillNode {
  const s: Skill = {
    _tag: 'Skill',
    name: definition.name,
    description: definition.description,
    instructions: definition.instructions.trim(),
    source: { type: 'inline' },
    metadata: definition.metadata,
  };

  return {
    _tag: 'SkillNode',
    skill: s,
  };
}

/**
 * Create a SkillNode from an already-loaded Skill
 * Used by resolvers when importing from external sources
 */
export function fromSkill(s: Skill): SkillNode {
  return {
    _tag: 'SkillNode',
    skill: s,
  };
}
