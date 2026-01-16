#!/usr/bin/env bun
/**
 * Reset terminal state after Skillixer crash
 *
 * Run this if your terminal gets stuck after exiting Skillixer:
 *   bun run src/tui/reset-terminal.ts
 */

// Disable mouse tracking modes
process.stdout.write('\x1b[?1000l'); // X10 mouse
process.stdout.write('\x1b[?1002l'); // Button event mouse
process.stdout.write('\x1b[?1003l'); // Any event mouse
process.stdout.write('\x1b[?1006l'); // SGR extended mouse

// Exit alternate screen buffer
process.stdout.write('\x1b[?1049l');

// Show cursor
process.stdout.write('\x1b[?25h');

// Reset all attributes
process.stdout.write('\x1b[0m');

// Clear screen
process.stdout.write('\x1b[2J\x1b[H');

console.log('Terminal state reset complete.');
console.log('If still having issues, try: reset');
