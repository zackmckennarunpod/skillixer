/**
 * Tests for AST describer
 */
import { describe, test, expect } from 'bun:test';
import { skill, pipe, parallel, fork, hydrate } from '../src/core/index.js';
import { describeAST, formatForCompiler } from '../src/compiler/describe.js';

describe('describeAST', () => {
  test('describes a simple skill', () => {
    const ast = skill({
      name: 'test-skill',
      instructions: 'Do something useful',
    });

    const desc = describeAST(ast);

    expect(desc.skills).toHaveLength(1);
    expect(desc.skills[0].name).toBe('test-skill');
    expect(desc.maxDepth).toBe(1);
    expect(desc.patterns.size).toBe(0);
  });

  test('describes a pipe composition', () => {
    const ast = pipe(
      skill({ name: 'step1', instructions: 'First step' }),
      skill({ name: 'step2', instructions: 'Second step' })
    );

    const desc = describeAST(ast);

    expect(desc.skills).toHaveLength(2);
    expect(desc.patterns.has('sequential')).toBe(true);
    expect(desc.tree).toContain('SEQUENCE');
  });

  test('describes a parallel composition', () => {
    const ast = parallel(
      skill({ name: 'search1', instructions: 'Search source 1' }),
      skill({ name: 'search2', instructions: 'Search source 2' })
    );

    const desc = describeAST(ast);

    expect(desc.skills).toHaveLength(2);
    expect(desc.patterns.has('parallel')).toBe(true);
    expect(desc.tree).toContain('PARALLEL');
  });

  test('describes a fork composition', () => {
    const ast = fork({
      when: 'severity === "critical"',
      then: skill({ name: 'alert', instructions: 'Alert team' }),
      else: skill({ name: 'log', instructions: 'Log finding' }),
    });

    const desc = describeAST(ast);

    expect(desc.skills).toHaveLength(2);
    expect(desc.patterns.has('conditional')).toBe(true);
    expect(desc.tree).toContain('BRANCH');
    expect(desc.tree).toContain('severity === "critical"');
  });

  test('describes a hydrated skill', () => {
    const ast = hydrate(skill({ name: 'search', instructions: 'Search for data' }), {
      service: 'payments',
      timeRange: '1h',
    });

    const desc = describeAST(ast);

    expect(desc.skills).toHaveLength(1);
    expect(desc.patterns.has('hydrated')).toBe(true);
    expect(desc.skills[0].hydrations).toHaveLength(1);
    expect(desc.skills[0].hydrations[0]).toEqual({ service: 'payments', timeRange: '1h' });
  });

  test('describes a complex nested composition', () => {
    const ast = pipe(
      parallel(
        skill({ name: 'search-logs', instructions: 'Search logs' }),
        skill({ name: 'search-metrics', instructions: 'Search metrics' })
      ),
      skill({ name: 'analyze', instructions: 'Analyze findings' }),
      fork({
        when: 'isUrgent',
        then: skill({ name: 'alert', instructions: 'Alert' }),
        else: skill({ name: 'log', instructions: 'Log' }),
      })
    );

    const desc = describeAST(ast);

    expect(desc.skills).toHaveLength(5);
    expect(desc.patterns.has('sequential')).toBe(true);
    expect(desc.patterns.has('parallel')).toBe(true);
    expect(desc.patterns.has('conditional')).toBe(true);
    expect(desc.maxDepth).toBe(3);
  });
});

describe('formatForCompiler', () => {
  test('formats description for compiler prompt', () => {
    const ast = pipe(
      skill({ name: 'gather', instructions: 'Gather data' }),
      skill({ name: 'analyze', instructions: 'Analyze data' })
    );

    const desc = describeAST(ast);
    const formatted = formatForCompiler(desc, 'test-workflow');

    expect(formatted).toContain('# Skill Composition: test-workflow');
    expect(formatted).toContain('## Composition Patterns Used: sequential');
    expect(formatted).toContain('## Composition Tree:');
    expect(formatted).toContain('## Individual Skills:');
    expect(formatted).toContain('### gather');
    expect(formatted).toContain('### analyze');
  });
});
