/**
 * fork() - Conditional branching
 * 
 * Branch execution based on a condition. The condition is evaluated
 * at runtime based on the context.
 */
import type { CompositionNode, ForkNode } from './types.js';

export interface ForkOptions {
  readonly when: string;
  readonly then: CompositionNode;
  readonly else?: CompositionNode;
}

/**
 * Create conditional branch
 * 
 * @example
 * ```typescript
 * export default pipe(
 *   analyze,
 *   fork({
 *     when: 'severity === "critical"',
 *     then: pipe(alertOncall, createIncident),
 *     else: logFinding
 *   })
 * );
 * ```
 */
export function fork(options: ForkOptions): ForkNode {
  if (!options.when) {
    throw new Error('fork() requires a "when" condition');
  }
  if (!options.then) {
    throw new Error('fork() requires a "then" branch');
  }

  return {
    _tag: 'ForkNode',
    condition: {
      when: options.when,
      then: options.then,
      else: options.else,
    },
  };
}
