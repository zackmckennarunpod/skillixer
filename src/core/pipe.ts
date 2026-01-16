/**
 * pipe() - Sequential composition
 * 
 * Composes skills to execute in order. Each skill receives
 * the cumulative context from previous skills.
 */
import type { CompositionNode, PipeNode, SkillNode } from './types.js';

type PipeableNode = CompositionNode | SkillNode;

/**
 * Compose skills sequentially
 * 
 * Order matters - each skill adds context for the next.
 * 
 * @example
 * ```typescript
 * export default pipe(
 *   infraContext('./config/services.yaml'),
 *   datadogSearch,
 *   summarize
 * );
 * ```
 */
export function pipe(...nodes: readonly PipeableNode[]): PipeNode {
  if (nodes.length === 0) {
    throw new Error('pipe() requires at least one node');
  }

  return {
    _tag: 'PipeNode',
    nodes,
  };
}
