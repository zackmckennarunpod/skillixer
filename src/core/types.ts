/**
 * Core types for Skillforge DSL
 * 
 * The type system represents skills as composable units that form
 * an AST (Abstract Syntax Tree) of composition operations.
 */

/** Source of a skill - where it was imported from */
export type SkillSource =
  | { type: 'inline' }
  | { type: 'local'; path: string }
  | { type: 'github'; owner: string; repo: string; path: string }
  | { type: 'git'; url: string; path: string };

/** A single skill definition */
export interface Skill {
  readonly _tag: 'Skill';
  readonly name: string;
  readonly description?: string;
  readonly instructions: string;
  readonly source: SkillSource;
  readonly metadata?: Record<string, unknown>;
}

/** Hydration config - context injected into a skill */
export interface HydrationConfig {
  readonly [key: string]: string | number | boolean | object;
}

/** Condition for forking */
export interface ForkCondition {
  readonly when: string;
  readonly then: CompositionNode;
  readonly else?: CompositionNode;
}

/** 
 * Composition Node - represents a node in the composition AST
 * This is the core abstraction that allows functional composition
 */
export type CompositionNode =
  | SkillNode
  | PipeNode
  | ParallelNode
  | ForkNode
  | HydrateNode;

/** A leaf node - a single skill */
export interface SkillNode {
  readonly _tag: 'SkillNode';
  readonly skill: Skill;
}

/** Sequential composition - skills executed in order */
export interface PipeNode {
  readonly _tag: 'PipeNode';
  readonly nodes: readonly CompositionNode[];
}

/** Parallel composition - skills executed concurrently */
export interface ParallelNode {
  readonly _tag: 'ParallelNode';
  readonly nodes: readonly CompositionNode[];
}

/** Conditional branching */
export interface ForkNode {
  readonly _tag: 'ForkNode';
  readonly condition: ForkCondition;
}

/** A skill with injected context */
export interface HydrateNode {
  readonly _tag: 'HydrateNode';
  readonly node: CompositionNode;
  readonly config: HydrationConfig;
}

/** The compiled output - ready to emit as SKILL.md */
export interface CompiledSkill {
  readonly name: string;
  readonly description: string;
  readonly sections: readonly CompiledSection[];
  readonly metadata?: Record<string, unknown>;
}

export interface CompiledSection {
  readonly title: string;
  readonly content: string;
  readonly order: number;
}

/** Result of parsing a SKILL.md file */
export interface ParsedSkill {
  readonly frontmatter: Record<string, unknown>;
  readonly name: string;
  readonly description?: string;
  readonly instructions: string;
  readonly rawContent: string;
}

// Type guards
export const isSkillNode = (node: CompositionNode): node is SkillNode =>
  node._tag === 'SkillNode';

export const isPipeNode = (node: CompositionNode): node is PipeNode =>
  node._tag === 'PipeNode';

export const isParallelNode = (node: CompositionNode): node is ParallelNode =>
  node._tag === 'ParallelNode';

export const isForkNode = (node: CompositionNode): node is ForkNode =>
  node._tag === 'ForkNode';

export const isHydrateNode = (node: CompositionNode): node is HydrateNode =>
  node._tag === 'HydrateNode';
