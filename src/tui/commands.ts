/**
 * Skillixer - Command Handler
 *
 * Vim-style commands and hotkeys for spell weaving
 */

import type { Store } from './state.js';
import { flavorText } from './theme.js';

/** Hotkey mapping - direct and intuitive */
export const HOTKEYS = {
  // Spell operations (composition)
  s: 'skill', // Create new spell
  p: 'pipe', // Pipe spells together (sequential)
  a: 'parallel', // All at once (parallel execution)
  f: 'fork', // Fork based on condition
  h: 'hydrate', // Hydrate with context

  // Navigation
  j: 'down',
  k: 'up',
  l: 'expand',
  H: 'collapse', // Shift+h to not conflict with hydrate
  gg: 'top',
  G: 'bottom',
  Tab: 'next-panel',
  'S-Tab': 'prev-panel',

  // Views
  g: 'grimoire', // Open spell library
  b: 'bazaar', // Open marketplace
  v: 'preview', // Preview compiled output

  // Actions
  Enter: 'select',
  Escape: 'cancel',
  '/': 'search',
  ':': 'command',
  '?': 'help',
  q: 'quit',

  // Quick actions
  c: 'compile', // Compile composition
  i: 'import', // Import selected skill to workspace
  x: 'remove', // Remove selected node
  r: 'rename', // Rename/alias
} as const;

/** Command definitions with magical names */
export interface Command {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  execute: (store: Store, args: string[]) => Promise<void>;
}

/** Parse a command string into name and args */
export function parseCommand(input: string): { name: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  const name = parts[0]?.toLowerCase() ?? '';
  const args = parts.slice(1);
  return { name, args };
}

/** All available commands */
export const COMMANDS: Record<string, Command> = {
  // Spell creation
  inscribe: {
    name: 'inscribe',
    aliases: ['skill', 'new', 's'],
    description: 'Create a new spell inline',
    usage: ':inscribe <name>',
    execute: async (store, args) => {
      const name = args[0];
      if (!name) {
        store.dispatch({ type: 'SET_ERROR', error: 'Spell name required' });
        return;
      }
      store.dispatch({ type: 'SET_STATUS', message: `${flavorText.inscribing} ${name}` });
      // TODO: Open spell editor
    },
  },

  // Composition operations
  channel: {
    name: 'channel',
    aliases: ['pipe', 'p'],
    description: 'Pipe selected spells together sequentially',
    usage: ':channel',
    execute: async (store, _args) => {
      store.dispatch({ type: 'SET_STATUS', message: flavorText.channeling });
      // TODO: Create pipe from selected nodes
    },
  },

  conjure: {
    name: 'conjure',
    aliases: ['parallel', 'all', 'a'],
    description: 'Run selected spells in parallel',
    usage: ':conjure',
    execute: async (store, _args) => {
      store.dispatch({ type: 'SET_STATUS', message: flavorText.conjuring });
      // TODO: Create parallel from selected nodes
    },
  },

  divine: {
    name: 'divine',
    aliases: ['fork', 'if', 'f'],
    description: 'Add conditional fork based on a condition',
    usage: ':divine <condition>',
    execute: async (store, args) => {
      const condition = args.join(' ');
      if (!condition) {
        store.dispatch({ type: 'SET_ERROR', error: 'Condition required' });
        return;
      }
      store.dispatch({ type: 'SET_STATUS', message: `${flavorText.divining} (${condition})` });
      // TODO: Create fork node
    },
  },

  imbue: {
    name: 'imbue',
    aliases: ['hydrate', 'context', 'h'],
    description: 'Add context to the selected spell',
    usage: ':imbue <key>=<value>',
    execute: async (store, args) => {
      const kvPair = args.join(' ');
      if (!kvPair.includes('=')) {
        store.dispatch({ type: 'SET_ERROR', error: 'Format: key=value' });
        return;
      }
      store.dispatch({ type: 'SET_STATUS', message: flavorText.imbuing });
      // TODO: Add hydration to selected node
    },
  },

  // Compilation
  forge: {
    name: 'forge',
    aliases: ['compile', 'build', 'c'],
    description: 'Compile composition to SKILL.md',
    usage: ':forge [name]',
    execute: async (store, _args) => {
      store.dispatch({ type: 'SET_STATUS', message: flavorText.forging });
      store.dispatch({ type: 'SET_LOADING', loading: true });
      // TODO: Compile and show result
      store.dispatch({ type: 'SET_LOADING', loading: false });
    },
  },

  preview: {
    name: 'preview',
    aliases: ['view', 'show', 'v'],
    description: 'Preview compiled output',
    usage: ':preview',
    execute: async (store, _args) => {
      store.dispatch({ type: 'SET_VIEW_MODE', mode: 'preview' });
    },
  },

  // Library & Marketplace
  scry: {
    name: 'scry',
    aliases: ['search', 'find'],
    description: 'Search GitHub for skills',
    usage: ':scry <query>',
    execute: async (store, args) => {
      const query = args.join(' ');
      if (!query) {
        store.dispatch({ type: 'SET_ERROR', error: 'Search query required' });
        return;
      }
      store.dispatch({ type: 'SET_STATUS', message: flavorText.scrying });
      store.dispatch({ type: 'SET_SCRY_LOADING', loading: true });
      store.dispatch({ type: 'SET_SEARCH_QUERY', value: query });
      store.dispatch({ type: 'SET_VIEW_MODE', mode: 'bazaar' });
      // TODO: Perform GitHub search
      store.dispatch({ type: 'SET_SCRY_LOADING', loading: false });
    },
  },

  summon: {
    name: 'summon',
    aliases: ['import', 'add', 'install', 'i'],
    description: 'Import a skill from source',
    usage: ':summon <source>',
    execute: async (store, args) => {
      const source = args.join(' ');
      if (!source) {
        store.dispatch({ type: 'SET_ERROR', error: 'Source required (e.g., github:owner/repo/path)' });
        return;
      }
      store.dispatch({ type: 'SET_STATUS', message: `${flavorText.summoning} ${source}` });
      // TODO: Import skill and add to workspace
    },
  },

  grimoire: {
    name: 'grimoire',
    aliases: ['library', 'lib', 'g'],
    description: 'Open local skill library',
    usage: ':grimoire',
    execute: async (store, _args) => {
      store.dispatch({ type: 'SET_VIEW_MODE', mode: 'spellbook' });
    },
  },

  bazaar: {
    name: 'bazaar',
    aliases: ['market', 'marketplace', 'b'],
    description: 'Open the arcane marketplace',
    usage: ':bazaar',
    execute: async (store, _args) => {
      store.dispatch({ type: 'SET_VIEW_MODE', mode: 'bazaar' });
    },
  },

  // File operations
  save: {
    name: 'save',
    aliases: ['write', 'w'],
    description: 'Save composition to file',
    usage: ':save [path]',
    execute: async (store, args) => {
      const path = args[0] ?? 'composition.forge.ts';
      store.dispatch({ type: 'SET_STATUS', message: `Saving to ${path}...` });
      // TODO: Save composition
    },
  },

  load: {
    name: 'load',
    aliases: ['open', 'read', 'e'],
    description: 'Load composition from file',
    usage: ':load <path>',
    execute: async (store, args) => {
      const path = args[0];
      if (!path) {
        store.dispatch({ type: 'SET_ERROR', error: 'File path required' });
        return;
      }
      store.dispatch({ type: 'SET_STATUS', message: `Loading ${path}...` });
      // TODO: Load composition
    },
  },

  // Navigation
  quit: {
    name: 'quit',
    aliases: ['q', 'exit'],
    description: 'Exit Skillixer',
    usage: ':quit',
    execute: async (_store, _args) => {
      process.exit(0);
    },
  },

  help: {
    name: 'help',
    aliases: ['?', 'h'],
    description: 'Show help',
    usage: ':help',
    execute: async (store, _args) => {
      store.dispatch({ type: 'TOGGLE_HELP' });
    },
  },
};

/** Find a command by name or alias */
export function findCommand(nameOrAlias: string): Command | null {
  const lower = nameOrAlias.toLowerCase();

  // Direct match
  if (COMMANDS[lower]) {
    return COMMANDS[lower];
  }

  // Search aliases
  for (const cmd of Object.values(COMMANDS)) {
    if (cmd.aliases.includes(lower)) {
      return cmd;
    }
  }

  return null;
}

/** Execute a command string */
export async function executeCommand(store: Store, input: string): Promise<void> {
  const { name, args } = parseCommand(input);

  if (!name) {
    return;
  }

  const command = findCommand(name);

  if (!command) {
    store.dispatch({ type: 'SET_ERROR', error: `Unknown incantation: ${name}` });
    return;
  }

  try {
    await command.execute(store, args);
  } catch (error) {
    store.dispatch({
      type: 'SET_ERROR',
      error: `${flavorText.error} ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

/** Handle a hotkey press in normal mode */
export function handleHotkey(
  store: Store,
  key: string,
  modifiers: { shift?: boolean; ctrl?: boolean; alt?: boolean },
): boolean {
  const state = store.getState();

  // Build the key string with modifiers
  let keyStr = key;
  if (modifiers.shift && key.length === 1) {
    keyStr = key.toUpperCase();
  }

  // Special keys
  if (key === 'escape') {
    if (state.inputMode !== 'normal') {
      store.dispatch({ type: 'SET_INPUT_MODE', mode: 'normal' });
      store.dispatch({ type: 'SET_COMMAND_BUFFER', value: '' });
      return true;
    }
    if (state.viewMode !== 'grimoire') {
      store.dispatch({ type: 'SET_VIEW_MODE', mode: 'grimoire' });
      return true;
    }
    return false;
  }

  // Command mode trigger
  if (keyStr === ':') {
    store.dispatch({ type: 'SET_INPUT_MODE', mode: 'command' });
    store.dispatch({ type: 'SET_COMMAND_BUFFER', value: '' });
    return true;
  }

  // Search mode trigger
  if (keyStr === '/') {
    store.dispatch({ type: 'SET_INPUT_MODE', mode: 'search' });
    store.dispatch({ type: 'SET_SEARCH_QUERY', value: '' });
    return true;
  }

  // Help
  if (keyStr === '?') {
    store.dispatch({ type: 'TOGGLE_HELP' });
    return true;
  }

  // Quit
  if (keyStr === 'q' && state.inputMode === 'normal') {
    process.exit(0);
  }

  // View switches
  if (keyStr === 'g' && state.inputMode === 'normal') {
    store.dispatch({ type: 'SET_VIEW_MODE', mode: 'spellbook' });
    return true;
  }

  if (keyStr === 'b' && state.inputMode === 'normal') {
    store.dispatch({ type: 'SET_VIEW_MODE', mode: 'bazaar' });
    return true;
  }

  if (keyStr === 'v' && state.inputMode === 'normal') {
    store.dispatch({ type: 'SET_VIEW_MODE', mode: 'preview' });
    return true;
  }

  // Navigation
  if (keyStr === 'j') {
    // Move down in current list
    if (state.viewMode === 'spellbook') {
      const newIndex = Math.min(state.selectedSkillIndex + 1, state.localSkills.length - 1);
      store.dispatch({ type: 'SELECT_SKILL', index: newIndex });
    } else if (state.viewMode === 'bazaar') {
      const newIndex = Math.min(state.selectedResultIndex + 1, state.scryResults.length - 1);
      store.dispatch({ type: 'SELECT_RESULT', index: newIndex });
    }
    return true;
  }

  if (keyStr === 'k') {
    // Move up in current list
    if (state.viewMode === 'spellbook') {
      const newIndex = Math.max(state.selectedSkillIndex - 1, 0);
      store.dispatch({ type: 'SELECT_SKILL', index: newIndex });
    } else if (state.viewMode === 'bazaar') {
      const newIndex = Math.max(state.selectedResultIndex - 1, 0);
      store.dispatch({ type: 'SELECT_RESULT', index: newIndex });
    }
    return true;
  }

  // Composition operations
  if (state.inputMode === 'normal') {
    switch (keyStr) {
      case 's': // New skill
        store.dispatch({ type: 'SET_INPUT_MODE', mode: 'insert' });
        store.dispatch({ type: 'SET_STATUS', message: flavorText.inscribing });
        return true;

      case 'p': // Pipe
        store.dispatch({ type: 'SET_STATUS', message: flavorText.channeling });
        // TODO: Start pipe operation
        return true;

      case 'a': // Parallel
        store.dispatch({ type: 'SET_STATUS', message: flavorText.conjuring });
        // TODO: Start parallel operation
        return true;

      case 'f': // Fork
        store.dispatch({ type: 'SET_INPUT_MODE', mode: 'command' });
        store.dispatch({ type: 'SET_COMMAND_BUFFER', value: 'divine ' });
        return true;

      case 'h': // Hydrate
        store.dispatch({ type: 'SET_INPUT_MODE', mode: 'command' });
        store.dispatch({ type: 'SET_COMMAND_BUFFER', value: 'imbue ' });
        return true;

      case 'c': // Compile
        executeCommand(store, 'forge');
        return true;

      case 'i': // Import/install
        store.dispatch({ type: 'SET_STATUS', message: flavorText.summoning });
        // TODO: Import selected skill
        return true;
    }
  }

  return false;
}
