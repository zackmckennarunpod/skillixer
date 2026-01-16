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

  try {
    await startApp();
  } catch (error) {
    console.error('\n  ⊗ The spell has backfired:', error);
    process.exit(1);
  }
}
