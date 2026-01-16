/**
 * Skillixer TUI
 *
 * The Arcane Skill Composition Forge
 *
 * A magical terminal interface for composing agent skills
 * with vim-style commands and visual effects.
 */

export { SkillixerApp, startApp } from './app.js';
export { Store, createInitialState, type AppState, type Action } from './state.js';
export { colors, glyphs, modeIndicators, HELP_TEXT, flavorText } from './theme.js';
export { HOTKEYS, COMMANDS, executeCommand, handleHotkey, parseCommand, findCommand } from './commands.js';
export * from './ascii.js';
export * from './effects.js';

/** Reset terminal to clean state */
function resetTerminal(): void {
  process.stdout.write('\x1b[?1000l'); // Disable mouse tracking
  process.stdout.write('\x1b[?1002l'); // Disable mouse button tracking
  process.stdout.write('\x1b[?1003l'); // Disable all mouse tracking
  process.stdout.write('\x1b[?1006l'); // Disable SGR mouse mode
  process.stdout.write('\x1b[?25h'); // Show cursor
  process.stdout.write('\x1b[?1049l'); // Exit alternate screen
  process.stdout.write('\x1b[0m'); // Reset colors
}

// Direct CLI entry point
if (import.meta.main) {
  const { startApp } = await import('./app.js');

  console.log(`
    ╔═══════════════════════════════════════════════════════════════════════════╗
    ║                                                                           ║
    ║   ███████╗██╗  ██╗██╗██╗     ██╗     ██╗██╗  ██╗███████╗██████╗          ║
    ║   ██╔════╝██║ ██╔╝██║██║     ██║     ██║╚██╗██╔╝██╔════╝██╔══██╗         ║
    ║   ███████╗█████╔╝ ██║██║     ██║     ██║ ╚███╔╝ █████╗  ██████╔╝         ║
    ║   ╚════██║██╔═██╗ ██║██║     ██║     ██║ ██╔██╗ ██╔══╝  ██╔══██╗         ║
    ║   ███████║██║  ██╗██║███████╗███████╗██║██╔╝ ██╗███████╗██║  ██║         ║
    ║   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝         ║
    ║                                                                           ║
    ║              ✧･ﾟ: *✧･ﾟ THE ARCANE SKILL FORGE ･ﾟ✧*:･ﾟ✧                    ║
    ║                                                                           ║
    ╚═══════════════════════════════════════════════════════════════════════════╝
  `);

  console.log('\n  ✧ Initializing the forge...\n');
  console.log('  Press q to quit, ? for help\n');

  // Ensure terminal is reset on any exit
  process.on('exit', resetTerminal);
  process.on('SIGINT', () => {
    resetTerminal();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    resetTerminal();
    process.exit(0);
  });

  try {
    await startApp();
  } catch (error) {
    resetTerminal();
    console.error('\n  ⊗ The spell has backfired:', error);
    process.exit(1);
  }
}
