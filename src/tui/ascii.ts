/**
 * Skillixer - ASCII Art & Visual Effects
 *
 * Magical visual elements for the arcane forge
 */

/** Main logo - displayed on startup */
export const LOGO = `
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
`;

/** Compact header logo */
export const HEADER_LOGO = `╔═╗┬┌─┬┬  ┬  ┬─┐ ┬┌─┐┬─┐
╚═╗├┴┐││  │  │┌┴┬┘├┤ ├┬┘
╚═╝┴ ┴┴┴─┘┴─┘┴┴ └─└─┘┴└─`;

/** Potion/mixing animation frames */
export const MIXING_FRAMES = [
  `
    ╭───────╮
    │ ○ · ○ │
    │·  ⚗  ·│
    │ ○ · ○ │
    ╰───────╯
  `,
  `
    ╭───────╮
    │·○ · ○·│
    │  ⚗⚗   │
    │·○ · ○·│
    ╰───────╯
  `,
  `
    ╭───────╮
    │ ·○·○· │
    │ ⚗⚗⚗  │
    │ ·○·○· │
    ╰───────╯
  `,
  `
    ╭───────╮
    │ ✧·✧·✧ │
    │  ◆◇◆  │
    │ ✧·✧·✧ │
    ╰───────╯
  `,
];

/** Spell casting animation */
export const CASTING_FRAMES = [
  '   ✧',
  '  ✧ ✧',
  ' ✧ ◆ ✧',
  '✧ ◆◇◆ ✧',
  ' ✧ ◆ ✧',
  '  ✧ ✧',
  '   ✧',
];

/** Node type icons with color codes */
export const NODE_ICONS = {
  skill: {
    icon: `
┌─────────────────┐
│ ◆ SPELL         │
│                 │
│ {name}          │
│                 │
└─────────────────┘`,
    color: '#ff6b35', // ember
  },
  pipe: {
    icon: `
┌─────────────────┐
│ → CHANNEL       │
│    ═══════>     │
│ Sequential flow │
└─────────────────┘`,
    color: '#58a6ff', // sapphire
  },
  parallel: {
    icon: `
┌─────────────────┐
│ ⫘ CONJURE       │
│   ╔═══╦═══╗     │
│   ║   ║   ║     │
│   ╚═══╩═══╝     │
└─────────────────┘`,
    color: '#3fb950', // jade
  },
  fork: {
    icon: `
┌─────────────────┐
│ ⎇ DIVINE        │
│       /│\\       │
│      / │ \\      │
│     ?  │  ?     │
└─────────────────┘`,
    color: '#ffd700', // gold
  },
  hydrate: {
    icon: `
┌─────────────────┐
│ ◈ IMBUE         │
│   ┌───┐         │
│   │{k}│ → ◆     │
│   └───┘         │
└─────────────────┘`,
    color: '#a371f7', // amethyst
  },
};

/** Connection lines between nodes */
export const CONNECTIONS = {
  horizontal: '═══',
  vertical: '║',
  cornerTR: '╗',
  cornerTL: '╔',
  cornerBR: '╝',
  cornerBL: '╚',
  teeRight: '╠',
  teeLeft: '╣',
  teeDown: '╦',
  teeUp: '╩',
  cross: '╬',
  arrow: '▸',
  arrowDown: '▾',
};

/** Welcome screen art */
export const WELCOME_ART = `
                            ✧
                           ╱│╲
                          ╱ │ ╲
                         ╱  │  ╲
                        ╱   ◆   ╲
                       ╱  ╱ │ ╲  ╲
                      ╱  ╱  │  ╲  ╲
                     ◇──◇───◇───◇──◇
                      ╲  ╲  │  ╱  ╱
                       ╲  ╲ │ ╱  ╱
                        ╲   ◆   ╱
                         ╲  │  ╱
                          ╲ │ ╱
                           ╲│╱
                            ✧

     ┌─────────────────────────────────────────────────┐
     │  Welcome to the Arcane Skill Composition Forge  │
     │                                                 │
     │  Weave spells together to create powerful      │
     │  compound skills for your AI agents.           │
     │                                                 │
     │  Press ? for the grimoire of incantations      │
     │  Press : to enter command mode                 │
     └─────────────────────────────────────────────────┘
`;

/** Forge/compile animation */
export const FORGE_FRAMES = [
  `
  ╔═════════════╗
  ║   ·····    ║
  ║  ·     ·   ║
  ║ ·   ◆   ·  ║
  ║  ·     ·   ║
  ║   ·····    ║
  ╚═════════════╝
  `,
  `
  ╔═════════════╗
  ║   ★···★    ║
  ║  ·     ·   ║
  ║ ·   ◇   ·  ║
  ║  ·     ·   ║
  ║   ★···★    ║
  ╚═════════════╝
  `,
  `
  ╔═════════════╗
  ║   ★✧·✧★    ║
  ║  ✧     ✧   ║
  ║ ·   ◆   ·  ║
  ║  ✧     ✧   ║
  ║   ★✧·✧★    ║
  ╚═════════════╝
  `,
  `
  ╔═════════════╗
  ║   ★✧✦✧★    ║
  ║  ✧  ◈  ✧   ║
  ║ ✦  ◆◇◆  ✦  ║
  ║  ✧  ◈  ✧   ║
  ║   ★✧✦✧★    ║
  ╚═════════════╝
  `,
];

/** Scrying/search animation */
export const SCRY_FRAMES = [
  '◐ Peering through the veil...',
  '◓ Peering through the veil...',
  '◑ Peering through the veil...',
  '◒ Peering through the veil...',
];

/** Border styles for different states */
export const BORDERS = {
  normal: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
  },
  focused: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
  },
  selected: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃',
  },
};

/** Random magical colors for mixing effects */
export const MAGIC_COLORS = [
  '#9d4edd', // arcane purple
  '#ff6b35', // ember orange
  '#3fb950', // jade green
  '#58a6ff', // sapphire blue
  '#ffd700', // gold
  '#a371f7', // amethyst
  '#f85149', // ruby red
  '#79c0ff', // ice blue
  '#7ee787', // bright green
  '#d2a8ff', // light purple
  '#ffa657', // light orange
  '#ff7b72', // coral
];

/** Get a random magic color */
export function getRandomMagicColor(): string {
  return MAGIC_COLORS[Math.floor(Math.random() * MAGIC_COLORS.length)] ?? MAGIC_COLORS[0]!;
}

/** Get colors that blend between two node types */
export function getMixingColors(nodeType1: keyof typeof NODE_ICONS, nodeType2: keyof typeof NODE_ICONS): string[] {
  const color1 = NODE_ICONS[nodeType1].color;
  const color2 = NODE_ICONS[nodeType2].color;
  return [color1, getRandomMagicColor(), color2];
}

/** Generate a sparkle trail effect */
export function generateSparkleTrail(length: number): string {
  const sparkles = ['✧', '·', '★', '✦', '◇', '◆'];
  let trail = '';
  for (let i = 0; i < length; i++) {
    trail += sparkles[Math.floor(Math.random() * sparkles.length)] ?? '✧';
  }
  return trail;
}

/** Status bar decorations */
export const STATUS_DECORATIONS = {
  left: '╣',
  right: '╠',
  separator: '│',
};

/** Panel headers */
export const PANEL_HEADERS = {
  workspace: '╔══════ ◆ WORKSPACE ══════╗',
  grimoire: '╔══════ ★ GRIMOIRE ══════╗',
  bazaar: '╔══════ ✧ BAZAAR ══════╗',
  canvas: '╔══════ ⚗ COMPOSITION ══════╗',
  preview: '╔══════ ◇ PREVIEW ══════╗',
};

/** Error/warning decorations */
export const ALERTS = {
  error: '⊗',
  warning: '⚠',
  success: '✓',
  info: '◈',
};

/** Loading spinner frames */
export const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const;

/** Generate loading animation text */
export function getSpinnerFrame(tick: number): string {
  return SPINNER_FRAMES[tick % SPINNER_FRAMES.length] ?? '⠋';
}
