/**
 * Tests for SKILL.md parser
 */
import { describe, test, expect } from 'bun:test';
import { parseSkillMd } from '../src/resolve/parse.js';

describe('parseSkillMd', () => {
  test('parses skill with frontmatter', () => {
    const content = `---
name: test-skill
description: A test skill
---

# Test Skill

Do something useful.
`;

    const parsed = parseSkillMd(content);

    expect(parsed.name).toBe('test-skill');
    expect(parsed.description).toBe('A test skill');
    expect(parsed.instructions).toContain('# Test Skill');
    expect(parsed.instructions).toContain('Do something useful.');
    expect(parsed.frontmatter).toEqual({
      name: 'test-skill',
      description: 'A test skill',
    });
  });

  test('parses skill without frontmatter', () => {
    const content = `# Simple Skill

Just do the thing.
`;

    const parsed = parseSkillMd(content);

    expect(parsed.name).toBe('unnamed-skill');
    expect(parsed.description).toBeUndefined();
    expect(parsed.instructions).toContain('# Simple Skill');
    expect(parsed.frontmatter).toEqual({});
  });

  test('extracts name from path when no frontmatter name', () => {
    const content = `---
description: A skill
---

Instructions here.
`;

    const parsed = parseSkillMd(content, '/path/to/my-skill.md');

    expect(parsed.name).toBe('my-skill');
  });

  test('extracts name from various filename formats', () => {
    const content = `Instructions only`;

    // Simple filename
    expect(parseSkillMd(content, '/path/to/datadog-search.md').name).toBe('datadog-search');

    // Nested path
    expect(parseSkillMd(content, '/some/nested/path/analyzer.md').name).toBe('analyzer');
  });

  test('preserves raw content', () => {
    const content = `---
name: test
---

# Header

Content here.
`;

    const parsed = parseSkillMd(content);

    expect(parsed.rawContent).toBe(content);
  });

  test('throws on invalid frontmatter', () => {
    const content = `---
name: [invalid yaml
---

Content
`;

    expect(() => parseSkillMd(content)).toThrow('Invalid YAML frontmatter');
  });

  test('throws on unclosed frontmatter', () => {
    const content = `---
name: test
no closing delimiter

Content
`;

    expect(() => parseSkillMd(content)).toThrow('frontmatter not closed');
  });
});
