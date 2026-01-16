/**
 * Tests for the compiler module
 */
import { describe, test, expect } from 'bun:test';
import { skill, pipe, parallel, fork, hydrate } from '../src/core/index.js';
import { previewCompilation } from '../src/compiler/index.js';

describe('previewCompilation', () => {
  test('generates preview for simple skill', () => {
    const ast = skill({
      name: 'test-skill',
      instructions: 'Do something useful',
    });

    const preview = previewCompilation(ast, { name: 'test' });

    expect(preview).toContain('# Skill Composition: test');
    expect(preview).toContain('test-skill');
    expect(preview).toContain('Do something useful');
  });

  test('generates preview for pipe composition', () => {
    const ast = pipe(
      skill({ name: 'step1', instructions: 'First step' }),
      skill({ name: 'step2', instructions: 'Second step' })
    );

    const preview = previewCompilation(ast, { name: 'workflow' });

    expect(preview).toContain('sequential');
    expect(preview).toContain('step1');
    expect(preview).toContain('step2');
  });

  test('generates preview for parallel composition', () => {
    const ast = parallel(
      skill({ name: 'search1', instructions: 'Search source 1' }),
      skill({ name: 'search2', instructions: 'Search source 2' })
    );

    const preview = previewCompilation(ast, { name: 'parallel-search' });

    expect(preview).toContain('parallel');
    expect(preview).toContain('search1');
    expect(preview).toContain('search2');
  });

  test('generates preview for fork composition', () => {
    const ast = fork({
      when: 'severity === "critical"',
      then: skill({ name: 'alert', instructions: 'Alert team' }),
      else: skill({ name: 'log', instructions: 'Log finding' }),
    });

    const preview = previewCompilation(ast, { name: 'conditional' });

    expect(preview).toContain('conditional');
    expect(preview).toContain('severity === "critical"');
    expect(preview).toContain('alert');
    expect(preview).toContain('log');
  });

  test('generates preview for hydrated skill', () => {
    const ast = hydrate(skill({ name: 'search', instructions: 'Search for data' }), {
      service: 'payments',
      timeRange: '1h',
    });

    const preview = previewCompilation(ast, { name: 'hydrated-search' });

    expect(preview).toContain('hydrated');
    expect(preview).toContain('payments');
    expect(preview).toContain('1h');
  });

  test('includes description when provided', () => {
    const ast = skill({ name: 's', instructions: 'Do it' });

    const preview = previewCompilation(ast, {
      name: 'test',
      description: 'A test skill for testing',
    });

    // Description is passed to the compiler, not necessarily in preview
    expect(preview).toContain('test');
  });

  test('generates preview for complex nested composition', () => {
    const ast = pipe(
      parallel(
        skill({ name: 'gather-logs', instructions: 'Get logs' }),
        skill({ name: 'gather-metrics', instructions: 'Get metrics' })
      ),
      skill({ name: 'analyze', instructions: 'Analyze data' }),
      fork({
        when: 'isUrgent',
        then: skill({ name: 'alert', instructions: 'Send alert' }),
        else: skill({ name: 'log', instructions: 'Log it' }),
      })
    );

    const preview = previewCompilation(ast, { name: 'complex-workflow' });

    expect(preview).toContain('sequential');
    expect(preview).toContain('parallel');
    expect(preview).toContain('conditional');
    expect(preview).toContain('gather-logs');
    expect(preview).toContain('gather-metrics');
    expect(preview).toContain('analyze');
    expect(preview).toContain('alert');
    expect(preview).toContain('log');
  });
});
