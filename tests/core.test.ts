/**
 * Tests for core DSL
 */
import { describe, test, expect } from 'bun:test';
import {
  skill,
  pipe,
  parallel,
  fork,
  hydrate,
  isSkillNode,
  isPipeNode,
  isParallelNode,
  isForkNode,
  isHydrateNode,
} from '../src/core/index.js';

describe('skill()', () => {
  test('creates a SkillNode', () => {
    const node = skill({
      name: 'test',
      instructions: 'Do something',
    });

    expect(node._tag).toBe('SkillNode');
    expect(node.skill.name).toBe('test');
    expect(node.skill.instructions).toBe('Do something');
    expect(node.skill.source.type).toBe('inline');
  });

  test('trims instructions', () => {
    const node = skill({
      name: 'test',
      instructions: '  \n  Do something  \n  ',
    });

    expect(node.skill.instructions).toBe('Do something');
  });

  test('accepts optional description and metadata', () => {
    const node = skill({
      name: 'test',
      description: 'A test skill',
      instructions: 'Do it',
      metadata: { version: '1.0' },
    });

    expect(node.skill.description).toBe('A test skill');
    expect(node.skill.metadata).toEqual({ version: '1.0' });
  });
});

describe('pipe()', () => {
  test('creates a PipeNode', () => {
    const s1 = skill({ name: 's1', instructions: 'Step 1' });
    const s2 = skill({ name: 's2', instructions: 'Step 2' });

    const node = pipe(s1, s2);

    expect(node._tag).toBe('PipeNode');
    expect(node.nodes).toHaveLength(2);
  });

  test('throws on empty input', () => {
    expect(() => pipe()).toThrow('requires at least one node');
  });

  test('accepts nested compositions', () => {
    const s1 = skill({ name: 's1', instructions: 'S1' });
    const s2 = skill({ name: 's2', instructions: 'S2' });
    const s3 = skill({ name: 's3', instructions: 'S3' });

    const node = pipe(parallel(s1, s2), s3);

    expect(node.nodes).toHaveLength(2);
    expect(node.nodes[0]._tag).toBe('ParallelNode');
    expect(node.nodes[1]._tag).toBe('SkillNode');
  });
});

describe('parallel()', () => {
  test('creates a ParallelNode', () => {
    const s1 = skill({ name: 's1', instructions: 'S1' });
    const s2 = skill({ name: 's2', instructions: 'S2' });

    const node = parallel(s1, s2);

    expect(node._tag).toBe('ParallelNode');
    expect(node.nodes).toHaveLength(2);
  });

  test('throws on empty input', () => {
    expect(() => parallel()).toThrow('requires at least one node');
  });
});

describe('fork()', () => {
  test('creates a ForkNode', () => {
    const thenBranch = skill({ name: 'then', instructions: 'Then' });
    const elseBranch = skill({ name: 'else', instructions: 'Else' });

    const node = fork({
      when: 'condition',
      then: thenBranch,
      else: elseBranch,
    });

    expect(node._tag).toBe('ForkNode');
    expect(node.condition.when).toBe('condition');
    expect(node.condition.then).toBe(thenBranch);
    expect(node.condition.else).toBe(elseBranch);
  });

  test('allows optional else branch', () => {
    const thenBranch = skill({ name: 'then', instructions: 'Then' });

    const node = fork({
      when: 'condition',
      then: thenBranch,
    });

    expect(node.condition.else).toBeUndefined();
  });

  test('throws on missing when', () => {
    expect(() =>
      fork({
        when: '',
        then: skill({ name: 't', instructions: 't' }),
      })
    ).toThrow('requires a "when" condition');
  });

  test('throws on missing then', () => {
    expect(() =>
      fork({
        when: 'condition',
        then: undefined as any,
      })
    ).toThrow('requires a "then" branch');
  });
});

describe('hydrate()', () => {
  test('creates a HydrateNode', () => {
    const s = skill({ name: 's', instructions: 'S' });

    const node = hydrate(s, { key: 'value' });

    expect(node._tag).toBe('HydrateNode');
    expect(node.node).toBe(s);
    expect(node.config).toEqual({ key: 'value' });
  });

  test('throws on missing node', () => {
    expect(() => hydrate(undefined as any, { key: 'value' })).toThrow('requires a node');
  });

  test('throws on empty config', () => {
    const s = skill({ name: 's', instructions: 'S' });
    expect(() => hydrate(s, {})).toThrow('requires non-empty config');
  });
});

describe('type guards', () => {
  test('isSkillNode', () => {
    const s = skill({ name: 's', instructions: 's' });
    expect(isSkillNode(s)).toBe(true);
    expect(isSkillNode(pipe(s))).toBe(false);
  });

  test('isPipeNode', () => {
    const s = skill({ name: 's', instructions: 's' });
    expect(isPipeNode(pipe(s))).toBe(true);
    expect(isPipeNode(s)).toBe(false);
  });

  test('isParallelNode', () => {
    const s = skill({ name: 's', instructions: 's' });
    expect(isParallelNode(parallel(s))).toBe(true);
    expect(isParallelNode(s)).toBe(false);
  });

  test('isForkNode', () => {
    const s = skill({ name: 's', instructions: 's' });
    expect(isForkNode(fork({ when: 'c', then: s }))).toBe(true);
    expect(isForkNode(s)).toBe(false);
  });

  test('isHydrateNode', () => {
    const s = skill({ name: 's', instructions: 's' });
    expect(isHydrateNode(hydrate(s, { k: 'v' }))).toBe(true);
    expect(isHydrateNode(s)).toBe(false);
  });
});
