/**
 * Tests for GitHub resolver
 */
import { describe, test, expect } from 'bun:test';
import { parseGitHubRef } from '../src/resolve/github.js';

describe('parseGitHubRef', () => {
  test('parses basic owner/repo/path format', () => {
    const result = parseGitHubRef('anthropics/skills/datadog-search.md');

    expect(result.owner).toBe('anthropics');
    expect(result.repo).toBe('skills');
    expect(result.path).toBe('datadog-search.md');
    expect(result.ref).toBeUndefined();
  });

  test('parses github: prefix', () => {
    const result = parseGitHubRef('github:anthropics/skills/datadog-search.md');

    expect(result.owner).toBe('anthropics');
    expect(result.repo).toBe('skills');
    expect(result.path).toBe('datadog-search.md');
  });

  test('parses nested path', () => {
    const result = parseGitHubRef('anthropics/skills/monitoring/datadog/search.md');

    expect(result.owner).toBe('anthropics');
    expect(result.repo).toBe('skills');
    expect(result.path).toBe('monitoring/datadog/search.md');
  });

  test('parses ref (branch/tag)', () => {
    const result = parseGitHubRef('anthropics/skills/datadog-search.md@v1.0.0');

    expect(result.owner).toBe('anthropics');
    expect(result.repo).toBe('skills');
    expect(result.path).toBe('datadog-search.md');
    expect(result.ref).toBe('v1.0.0');
  });

  test('parses ref with branch name', () => {
    const result = parseGitHubRef('anthropics/skills/datadog-search.md@main');

    expect(result.ref).toBe('main');
  });

  test('parses ref with commit hash', () => {
    const result = parseGitHubRef('anthropics/skills/datadog-search.md@abc123');

    expect(result.ref).toBe('abc123');
  });

  test('parses complex path with ref', () => {
    const result = parseGitHubRef('github:org/repo/path/to/skill.md@feature/branch');

    expect(result.owner).toBe('org');
    expect(result.repo).toBe('repo');
    expect(result.path).toBe('path/to/skill.md');
    expect(result.ref).toBe('feature/branch');
  });

  test('throws on invalid format (missing path)', () => {
    expect(() => parseGitHubRef('anthropics/skills')).toThrow('Invalid GitHub reference');
  });

  test('throws on invalid format (only owner)', () => {
    expect(() => parseGitHubRef('anthropics')).toThrow('Invalid GitHub reference');
  });

  test('throws on empty string', () => {
    expect(() => parseGitHubRef('')).toThrow('Invalid GitHub reference');
  });
});
