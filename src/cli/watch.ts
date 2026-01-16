/**
 * Watch Mode - Rebuild on file changes
 *
 * Watches .forge.ts files and recompiles when they change.
 */
import { watch } from 'node:fs';
import { resolve, basename } from 'node:path';
import { buildCommand, type BuildOptions } from './build.js';

export interface WatchOptions extends Omit<BuildOptions, 'dryRun'> {
  debounceMs?: number;
}

export async function watchCommand(
  forgeFile: string | undefined,
  options: WatchOptions
): Promise<void> {
  if (!forgeFile) {
    throw new Error('No forge file specified. Usage: skillixer watch <file.forge.ts>');
  }

  const absolutePath = resolve(process.cwd(), forgeFile);
  const debounceMs = options.debounceMs ?? 500;

  console.log(`👀 Watching: ${absolutePath}`);
  console.log(`📁 Output: ${options.outDir}`);
  console.log('\nPress Ctrl+C to stop.\n');

  // Initial build
  console.log('🔨 Initial build...');
  try {
    await buildCommand(forgeFile, { ...options, dryRun: false });
  } catch (error) {
    console.error(`❌ Build failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Watch for changes
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let building = false;

  const watcher = watch(absolutePath, async (eventType) => {
    if (eventType !== 'change') return;
    if (building) return;

    // Debounce rapid changes
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      building = true;
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n[${timestamp}] 🔄 File changed, rebuilding...`);

      try {
        await buildCommand(forgeFile, { ...options, dryRun: false });
        console.log(`[${timestamp}] ✅ Rebuild complete`);
      } catch (error) {
        console.error(`[${timestamp}] ❌ Build failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      building = false;
    }, debounceMs);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watch mode...');
    watcher.close();
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {});
}
