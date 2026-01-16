/**
 * parallel() - Concurrent composition
 * 
 * Runs skills in parallel. All skills receive the same input context
 * and their outputs are combined.
 */
import type { CompositionNode, ParallelNode } from './types.js';

/**
 * Run skills concurrently
 * 
 * @example
 * ```typescript
 * export default pipe(
 *   parallel(
 *     datadogSearch,
 *     githubSearch,
 *     slackSearch
 *   ),
 *   summarize
 * );
 * ```
 */
export function parallel(...nodes: readonly CompositionNode[]): ParallelNode {
  if (nodes.length === 0) {
    throw new Error('parallel() requires at least one node');
  }

  return {
    _tag: 'ParallelNode',
    nodes,
  };
}
