/**
 * Skillforge - Compose agent skills into compound SKILL.md files
 *
 * @example
 * ```typescript
 * import { skill, pipe, parallel, fork, hydrate, compileWithAgent } from 'skillforge';
 *
 * const search = skill({
 *   name: 'search',
 *   instructions: 'Search for relevant data...'
 * });
 *
 * const analyze = skill({
 *   name: 'analyze',
 *   instructions: 'Analyze the findings...'
 * });
 *
 * const composition = pipe(
 *   parallel(search, anotherSkill),
 *   analyze,
 *   fork({
 *     when: 'severity === "critical"',
 *     then: alertSkill,
 *     else: logSkill
 *   })
 * );
 *
 * const result = await compileWithAgent(composition, { name: 'my-workflow' });
 * ```
 */

// Core DSL
export * from './core/index.js';

// Compiler
export { compileWithAgent, previewCompilation, type CompileOptions, type CompileResult } from './compiler/index.js';

// Resolvers
export { importLocal, importGitHub, resolveLocal, resolveGitHub, parseSkillMd } from './resolve/index.js';
