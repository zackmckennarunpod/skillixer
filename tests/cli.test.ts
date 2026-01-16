/**
 * End-to-end CLI tests
 */
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { $ } from 'bun';

const TEST_DIR = join(import.meta.dir, '../.test-cli');

describe('CLI end-to-end', () => {
  beforeAll(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  test('build command compiles a .forge.ts file', async () => {
    // Create a test forge file
    const forgeContent = `
import { skill, pipe } from '../src/index.js';

const step1 = skill({
  name: 'step1',
  instructions: 'Do the first thing'
});

const step2 = skill({
  name: 'step2',
  instructions: 'Do the second thing'
});

export default pipe(step1, step2);
`;

    const forgePath = join(TEST_DIR, 'test.forge.ts');
    await writeFile(forgePath, forgeContent);

    // Run the build command
    const result = await $`bun run src/cli/index.ts build ${forgePath} -o ${TEST_DIR}`.quiet();

    expect(result.exitCode).toBe(0);

    // Check output file exists
    const outputPath = join(TEST_DIR, 'test.md');
    const output = await readFile(outputPath, 'utf-8');

    expect(output).toContain('---');
    expect(output).toContain('name:');
    expect(output.toLowerCase()).toContain('step1');
    expect(output.toLowerCase()).toContain('step2');
  });

  test('preview command shows dry-run output', async () => {
    const forgeContent = `
import { skill } from '../src/index.js';

export default skill({
  name: 'preview-test',
  instructions: 'Test preview mode'
});
`;

    const forgePath = join(TEST_DIR, 'preview.forge.ts');
    await writeFile(forgePath, forgeContent);

    const result = await $`bun run src/cli/index.ts preview ${forgePath}`.quiet();

    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain('preview-test');
    expect(result.stdout.toString()).toContain('Dry run');
  });

  test('build with --name overrides skill name', async () => {
    const forgeContent = `
import { skill } from '../src/index.js';

export default skill({
  name: 'original-name',
  instructions: 'Some instructions'
});
`;

    const forgePath = join(TEST_DIR, 'name-override.forge.ts');
    await writeFile(forgePath, forgeContent);

    const result = await $`bun run src/cli/index.ts build ${forgePath} -o ${TEST_DIR} -n custom-name`.quiet();

    expect(result.exitCode).toBe(0);

    const outputPath = join(TEST_DIR, 'custom-name.md');
    const output = await readFile(outputPath, 'utf-8');

    expect(output).toContain('custom-name');
  });
});
