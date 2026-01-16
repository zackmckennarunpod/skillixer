/**
 * hydrate() - Inject context into a skill
 * 
 * Specializes a generic skill with specific configuration.
 * This allows reusing skills with different parameters.
 */
import type { CompositionNode, HydrationConfig, HydrateNode } from './types.js';

/**
 * Inject configuration into a skill
 * 
 * @example
 * ```typescript
 * import { datadogSearch } from 'github:anthropics/skills/datadog-search';
 * 
 * export const myDatadog = hydrate(datadogSearch, {
 *   services: './config/services.yaml',
 *   defaultTimeRange: '1h'
 * });
 * ```
 */
export function hydrate(
  node: CompositionNode,
  config: HydrationConfig
): HydrateNode {
  if (!node) {
    throw new Error('hydrate() requires a node');
  }
  if (!config || Object.keys(config).length === 0) {
    throw new Error('hydrate() requires non-empty config');
  }

  return {
    _tag: 'HydrateNode',
    node,
    config,
  };
}
