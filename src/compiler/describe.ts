/**
 * AST Describer - converts composition AST to natural language
 *
 * This module transforms the AST into a structured description that
 * the compiler agent can understand and synthesize into coherent prose.
 */
import type { CompositionNode, HydrationConfig } from '../core/types.js';

/** Description of the AST in a format suitable for agent synthesis */
export interface ASTDescription {
  /** Structured tree description */
  tree: string;
  /** All skills referenced in the composition */
  skills: SkillSummary[];
  /** Total depth of the composition tree */
  maxDepth: number;
  /** Composition patterns used */
  patterns: Set<'sequential' | 'parallel' | 'conditional' | 'hydrated'>;
}

export interface SkillSummary {
  name: string;
  description?: string;
  instructions: string;
  hydrations: HydrationConfig[];
}

/**
 * Describe an AST node recursively in natural language
 */
export function describeAST(node: CompositionNode): ASTDescription {
  const skills: SkillSummary[] = [];
  const patterns = new Set<'sequential' | 'parallel' | 'conditional' | 'hydrated'>();

  const tree = describeNode(node, 0, skills, patterns, []);
  const maxDepth = calculateDepth(node);

  return {
    tree,
    skills,
    maxDepth,
    patterns,
  };
}

function describeNode(
  node: CompositionNode,
  depth: number,
  skills: SkillSummary[],
  patterns: Set<'sequential' | 'parallel' | 'conditional' | 'hydrated'>,
  currentHydrations: HydrationConfig[]
): string {
  const indent = '  '.repeat(depth);

  switch (node._tag) {
    case 'SkillNode': {
      const { skill } = node;

      // Track this skill
      const existingSkill = skills.find((s) => s.name === skill.name);
      if (existingSkill) {
        // Add any new hydrations
        for (const h of currentHydrations) {
          if (!existingSkill.hydrations.includes(h)) {
            existingSkill.hydrations.push(h);
          }
        }
      } else {
        skills.push({
          name: skill.name,
          description: skill.description,
          instructions: skill.instructions,
          hydrations: [...currentHydrations],
        });
      }

      const hydrationNote =
        currentHydrations.length > 0
          ? ` [with config: ${JSON.stringify(currentHydrations)}]`
          : '';

      return `${indent}SKILL "${skill.name}"${hydrationNote}\n${indent}  Instructions: ${truncate(skill.instructions, 200)}`;
    }

    case 'PipeNode': {
      patterns.add('sequential');
      const steps = node.nodes
        .map((n, i) => {
          const stepDesc = describeNode(n, depth + 1, skills, patterns, currentHydrations);
          return `${indent}  ${i + 1}. ${stepDesc.trim()}`;
        })
        .join('\n');
      return `${indent}SEQUENCE (execute in order):\n${steps}`;
    }

    case 'ParallelNode': {
      patterns.add('parallel');
      const branches = node.nodes
        .map((n) => {
          const branchDesc = describeNode(n, depth + 1, skills, patterns, currentHydrations);
          return `${indent}  - ${branchDesc.trim()}`;
        })
        .join('\n');
      return `${indent}PARALLEL (execute concurrently):\n${branches}`;
    }

    case 'ForkNode': {
      patterns.add('conditional');
      const { condition } = node;
      const thenDesc = describeNode(
        condition.then,
        depth + 1,
        skills,
        patterns,
        currentHydrations
      );
      let result = `${indent}BRANCH on condition: "${condition.when}"\n${indent}  THEN:\n${thenDesc}`;

      if (condition.else) {
        const elseDesc = describeNode(
          condition.else,
          depth + 1,
          skills,
          patterns,
          currentHydrations
        );
        result += `\n${indent}  ELSE:\n${elseDesc}`;
      }

      return result;
    }

    case 'HydrateNode': {
      patterns.add('hydrated');
      const newHydrations = [...currentHydrations, node.config];
      return describeNode(node.node, depth, skills, patterns, newHydrations);
    }

    default: {
      const _exhaustive: never = node;
      throw new Error(`Unknown node type: ${(_exhaustive as CompositionNode)._tag}`);
    }
  }
}

function calculateDepth(node: CompositionNode): number {
  switch (node._tag) {
    case 'SkillNode':
      return 1;
    case 'PipeNode':
    case 'ParallelNode':
      return 1 + Math.max(...node.nodes.map(calculateDepth));
    case 'ForkNode':
      const thenDepth = calculateDepth(node.condition.then);
      const elseDepth = node.condition.else ? calculateDepth(node.condition.else) : 0;
      return 1 + Math.max(thenDepth, elseDepth);
    case 'HydrateNode':
      return calculateDepth(node.node);
  }
}

function truncate(str: string, maxLen: number): string {
  const normalized = str.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen - 3) + '...';
}

/**
 * Format the AST description for the compiler prompt
 */
export function formatForCompiler(desc: ASTDescription, name: string): string {
  const patternsUsed = Array.from(desc.patterns).join(', ') || 'simple';

  let output = `# Skill Composition: ${name}\n\n`;
  output += `## Composition Patterns Used: ${patternsUsed}\n\n`;
  output += `## Composition Tree:\n\n\`\`\`\n${desc.tree}\n\`\`\`\n\n`;

  output += `## Individual Skills:\n\n`;
  for (const skill of desc.skills) {
    output += `### ${skill.name}\n`;
    if (skill.description) {
      output += `> ${skill.description}\n\n`;
    }
    output += `**Instructions:**\n\`\`\`\n${skill.instructions}\n\`\`\`\n\n`;
    if (skill.hydrations.length > 0) {
      output += `**Hydrated with:**\n\`\`\`json\n${JSON.stringify(skill.hydrations, null, 2)}\n\`\`\`\n\n`;
    }
  }

  return output;
}
