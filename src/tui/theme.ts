/**
 * Skillixer - Magical Theme
 *
 * An alchemical color palette for the arcane skill forge
 */

/** The mystical color palette */
export const colors = {
  // Primary magic colors
  arcane: '#9d4edd', // Primary purple - arcane energy
  void: '#0d1117', // Deep void black - background
  obsidian: '#161b22', // Dark obsidian - panels
  slate: '#21262d', // Dark slate - borders
  mist: '#30363d', // Misty gray - inactive

  // Accent colors
  gold: '#ffd700', // Alchemical gold - highlights
  ember: '#ff6b35', // Fire ember - warnings
  jade: '#3fb950', // Jade green - success
  sapphire: '#58a6ff', // Sapphire blue - info
  ruby: '#f85149', // Ruby red - errors
  amethyst: '#a371f7', // Amethyst - secondary purple

  // Text colors
  parchment: '#e6edf3', // Light parchment - primary text
  silver: '#8b949e', // Silver - secondary text
  ghost: '#484f58', // Ghost gray - disabled text

  // Spell types
  channelColor: '#58a6ff', // pipe() - flowing water
  conjureColor: '#3fb950', // parallel() - life/growth
  divineColor: '#ffd700', // fork() - fate/light
  imbueColor: '#a371f7', // hydrate() - magic infusion
  inscribeColor: '#ff6b35', // skill() - fire/creation
} as const;

/** Border styles for different states */
export const borders = {
  default: 'single' as const,
  focused: 'double' as const,
  selected: 'rounded' as const,
};

/** ASCII art for the title */
export const TITLE_ART = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ███████╗██╗  ██╗██╗██╗     ██╗     ██╗██╗  ██╗███████╗██████╗               ║
║  ██╔════╝██║ ██╔╝██║██║     ██║     ██║╚██╗██╔╝██╔════╝██╔══██╗              ║
║  ███████╗█████╔╝ ██║██║     ██║     ██║ ╚███╔╝ █████╗  ██████╔╝              ║
║  ╚════██║██╔═██╗ ██║██║     ██║     ██║ ██╔██╗ ██╔══╝  ██╔══██╗              ║
║  ███████║██║  ██╗██║███████╗███████╗██║██╔╝ ██╗███████╗██║  ██║              ║
║  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝              ║
║                      ✧ The Arcane Skill Composition Forge ✧                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝`.trim();

/** Magical glyphs for decoration */
export const glyphs = {
  // Node type indicators
  spell: '◆', // ◆ spell/skill node
  channel: '→', // → pipe connection
  conjure: '⫘', // ⫘ parallel split
  divine: '⎇', // ⎇ fork/branch
  imbue: '◈', // ◈ hydrated node

  // UI decorations
  sparkle: '✧',
  star: '★',
  diamond: '◇',
  circle: '●',
  bullet: '•',
  arrow: '▸',
  check: '✓',
  cross: '✗',

  // Borders
  cornerTL: '╭',
  cornerTR: '╮',
  cornerBL: '╰',
  cornerBR: '╯',
  horizontal: '─',
  vertical: '│',

  // Status indicators
  pending: '○',
  active: '●',
  complete: '◉',
  error: '⊗',
};

/** Mode indicators for the status bar */
export const modeIndicators = {
  normal: { text: 'NORMAL', color: colors.jade },
  command: { text: 'COMMAND', color: colors.gold },
  insert: { text: 'INSERT', color: colors.sapphire },
  visual: { text: 'VISUAL', color: colors.amethyst },
  search: { text: 'SEARCH', color: colors.ember },
};

/** Help text for the command palette */
export const HELP_TEXT = `
╭─────────────────────────────────────────────────────────────────────────────╮
│                          ✧ ARCANE INCANTATIONS ✧                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  SPELL CRAFTING                         │  NAVIGATION                       │
│  ─────────────────                      │  ───────────                      │
│  i    Inscribe new spell                │  j/k   Move down/up               │
│  p    Channel (pipe spells)             │  h/l   Collapse/expand            │
│  c    Conjure (parallel)                │  gg    Go to top                  │
│  d    Divine (fork condition)           │  G     Go to bottom               │
│  h    Imbue (hydrate context)           │  /     Search                     │
│                                         │                                   │
│  LIBRARY & MARKETPLACE                  │  GENERAL                          │
│  ─────────────────────                  │  ───────                          │
│  g    Open Grimoire (library)           │  :     Command mode               │
│  s    Scry (search GitHub)              │  ?     Show this help             │
│  S    Summon from bazaar                │  q     Quit                       │
│  f    Forge (compile)                   │  Esc   Cancel/back                │
│  F    Preview artifact                  │  Tab   Switch panel               │
├─────────────────────────────────────────────────────────────────────────────┤
│  COMMANDS (prefix with :)                                                   │
│  ─────────────────────────                                                  │
│  :inscribe <name>      Create new spell inline                              │
│  :channel              Pipe selected spells together                        │
│  :conjure              Run selected spells in parallel                      │
│  :divine <condition>   Add conditional fork                                 │
│  :imbue <key>=<value>  Add context to spell                                 │
│  :forge [name]         Compile to SKILL.md                                  │
│  :scry <query>         Search GitHub for skills                             │
│  :summon <source>      Import skill from source                             │
│  :grimoire             Open local skill library                             │
│  :preview              Preview compiled output                              │
│  :save [path]          Save composition                                     │
│  :load <path>          Load composition                                     │
│  :q / :quit            Exit Skillixer                                       │
╰─────────────────────────────────────────────────────────────────────────────╯
`.trim();

/** Flavor text for various states */
export const flavorText = {
  welcome: 'The forge awaits your command...',
  inscribing: 'Inscribing arcane symbols...',
  channeling: 'Channeling magical energy...',
  conjuring: 'Conjuring parallel spirits...',
  divining: 'Reading the threads of fate...',
  imbuing: 'Infusing with mystical essence...',
  forging: 'Transmuting into final form...',
  scrying: 'Peering through the veil...',
  summoning: 'Calling forth from the ether...',
  error: 'The spell has backfired!',
  success: 'The enchantment is complete.',
};
