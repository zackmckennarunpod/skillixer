/**
 * Agent Compiler - uses Claude to synthesize coherent SKILL.md
 *
 * This is the core innovation: instead of mechanically concatenating skills,
 * an agent understands the composition intent and produces prose that flows.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { CompositionNode } from '../core/types.js';
import { describeAST, formatForCompiler } from './describe.js';

export interface CompileOptions {
  /** Name of the compiled skill */
  name: string;
  /** Optional description */
  description?: string;
  /** Model to use for compilation */
  model?: string;
  /** Maximum tokens for response */
  maxTokens?: number;
  /** Custom system prompt (for advanced users) */
  systemPrompt?: string;
}

export interface CompileResult {
  /** The compiled SKILL.md content */
  content: string;
  /** Metadata about the compilation */
  metadata: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    skillCount: number;
    patterns: string[];
  };
}

const DEFAULT_SYSTEM_PROMPT = `You are a skill compiler for Claude Code. Your job is to synthesize multiple skill definitions into a single, coherent SKILL.md file.

## What You're Given

You receive a "composition" - a functional description of how skills should work together:
- **SEQUENCE** (pipe): Skills execute in order, each building on the previous
- **PARALLEL**: Skills execute concurrently, gathering information simultaneously
- **BRANCH** (fork): Conditional paths based on runtime conditions
- **Hydration**: Configuration injected into generic skills

## Your Output

Produce a single SKILL.md that:

1. **Reads as unified prose**, not pasted-together sections
2. **Preserves logical flow** from the composition structure
3. **Makes parallel operations natural**: "Gather evidence from X, Y, and Z simultaneously"
4. **Expresses conditionals as decision points**: "Based on severity, either alert oncall or log the finding"
5. **Embeds hydration config** naturally in the instructions

## Output Format

\`\`\`markdown
---
name: <skill-name>
description: <one-line description>
---

# <Skill Title>

<Brief introduction explaining what this skill does and when to use it>

## <Section 1>
...

## <Section 2>
...
\`\`\`

## Style Guidelines

- Write in second person ("You will...", "Search for...")
- Use active voice
- Be specific and actionable
- Include all information from source skills - don't summarize away details
- Keep the original intent but improve the presentation
- If skills have overlapping instructions, merge them intelligently
- For hydrated configs, incorporate them as embedded context or examples

## Important

- Output ONLY the SKILL.md content, no commentary
- Include the YAML frontmatter
- Preserve all actionable instructions from the source skills
- The result should be immediately usable as a Claude Code skill`;

/**
 * Compile a composition AST into a SKILL.md using Claude
 */
export async function compileWithAgent(
  ast: CompositionNode,
  options: CompileOptions
): Promise<CompileResult> {
  const client = new Anthropic();
  const model = options.model ?? 'claude-sonnet-4-20250514';
  const maxTokens = options.maxTokens ?? 4096;
  const systemPrompt = options.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

  // Describe the AST
  const description = describeAST(ast);
  const formattedInput = formatForCompiler(description, options.name);

  // Build the user prompt
  let userPrompt = `Synthesize a SKILL.md from this composition:\n\n${formattedInput}`;

  if (options.description) {
    userPrompt += `\n\n**Desired skill description:** ${options.description}`;
  }

  // Call Claude
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  // Extract the content
  const content = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  // Clean up - remove markdown code fences if present
  const cleaned = cleanMarkdownFences(content);

  return {
    content: cleaned,
    metadata: {
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      skillCount: description.skills.length,
      patterns: Array.from(description.patterns),
    },
  };
}

/**
 * Remove markdown code fences from the output if Claude wrapped it
 */
function cleanMarkdownFences(content: string): string {
  let result = content.trim();

  // Remove leading ```markdown or ```
  if (result.startsWith('```markdown')) {
    result = result.slice('```markdown'.length);
  } else if (result.startsWith('```')) {
    result = result.slice('```'.length);
  }

  // Remove trailing ```
  if (result.endsWith('```')) {
    result = result.slice(0, -3);
  }

  return result.trim();
}

/**
 * Preview what will be sent to the compiler (useful for debugging)
 */
export function previewCompilation(
  ast: CompositionNode,
  options: Pick<CompileOptions, 'name' | 'description'>
): string {
  const description = describeAST(ast);
  return formatForCompiler(description, options.name);
}
