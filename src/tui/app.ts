/**
 * Skillixer - Main Application
 *
 * The arcane skill composition forge
 */

// @ts-expect-error - OpenTUI types don't resolve correctly in tsc but work in bun
import * as OpenTUI from '@opentui/core';

const {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
  InputRenderable,
  SelectRenderable,
  ScrollBoxRenderable,
  ASCIIFontRenderable,
  KeyEvent,
} = OpenTUI;

type CliRenderer = InstanceType<typeof OpenTUI.CliRenderer>;
type KeyEventType = InstanceType<typeof OpenTUI.KeyEvent>;

import { Store, type AppState } from './state.js';
import { colors, glyphs, modeIndicators, HELP_TEXT, flavorText } from './theme.js';
import { handleHotkey, executeCommand } from './commands.js';

/** The main Skillixer application */
export class SkillixerApp {
  private renderer!: CliRenderer;
  private store: Store;

  // Layout containers
  private root!: BoxRenderable;
  private header!: BoxRenderable;
  private main!: BoxRenderable;
  private sidebar!: BoxRenderable;
  private canvas!: BoxRenderable;
  private statusBar!: BoxRenderable;
  private commandLine!: BoxRenderable;

  // UI elements
  private title!: ASCIIFontRenderable;
  private modeIndicator!: TextRenderable;
  private statusText!: TextRenderable;
  private commandInput!: InputRenderable;
  private skillList!: SelectRenderable;
  private workspaceList!: SelectRenderable;
  private graphView!: ScrollBoxRenderable;
  private helpOverlay!: BoxRenderable;

  constructor() {
    this.store = new Store();
  }

  /** Initialize and start the application */
  async start(): Promise<void> {
    // Create renderer
    this.renderer = await createCliRenderer({
      exitOnCtrlC: true,
      targetFps: 30,
      useMouse: true,
      useAlternateScreen: true,
    });

    this.renderer.setBackgroundColor(colors.void);

    // Build the UI
    this.buildLayout();
    this.bindEvents();

    // Subscribe to state changes
    this.store.subscribe((state) => this.render(state));

    // Initial render
    this.render(this.store.getState());

    // Start the renderer
    this.renderer.start();
  }

  /** Build the main layout */
  private buildLayout(): void {
    const { root } = this.renderer;

    // Main container
    this.root = new BoxRenderable(this.renderer, {
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: colors.void,
    });
    root.add(this.root);

    // Header with title
    this.header = new BoxRenderable(this.renderer, {
      flexShrink: 0,
      height: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 2,
      paddingRight: 2,
      backgroundColor: colors.obsidian,
      borderColor: colors.arcane,
      border: ['bottom'],
    });
    this.root.add(this.header);

    // Title
    this.title = new ASCIIFontRenderable(this.renderer, {
      text: 'SKILLIXER',
      font: 'tiny',
      color: colors.arcane,
      backgroundColor: 'transparent',
    });
    this.header.add(this.title);

    // Mode indicator
    this.modeIndicator = new TextRenderable(this.renderer, {
      content: `${glyphs.sparkle} NORMAL`,
      fg: colors.jade,
      backgroundColor: 'transparent',
    });
    this.header.add(this.modeIndicator);

    // Main content area (sidebar + canvas)
    this.main = new BoxRenderable(this.renderer, {
      flexGrow: 1,
      flexDirection: 'row',
      backgroundColor: colors.void,
    });
    this.root.add(this.main);

    // Sidebar (installed skills + library)
    this.sidebar = new BoxRenderable(this.renderer, {
      width: 35,
      flexShrink: 0,
      flexDirection: 'column',
      backgroundColor: colors.obsidian,
      borderColor: colors.slate,
      border: ['right'],
    });
    this.main.add(this.sidebar);

    // Workspace section (installed skills)
    const workspaceHeader = new TextRenderable(this.renderer, {
      content: `${glyphs.diamond} WORKSPACE`,
      fg: colors.gold,
      backgroundColor: colors.slate,
      paddingLeft: 1,
      height: 1,
    });
    this.sidebar.add(workspaceHeader);

    this.workspaceList = new SelectRenderable(this.renderer, {
      height: 10,
      backgroundColor: colors.obsidian,
      textColor: colors.parchment,
      selectedBackgroundColor: colors.arcane,
      selectedTextColor: colors.parchment,
      focusedBackgroundColor: colors.slate,
      showDescription: true,
      descriptionColor: colors.silver,
      options: [],
      wrapSelection: true,
    });
    this.sidebar.add(this.workspaceList);

    // Library section
    const libraryHeader = new TextRenderable(this.renderer, {
      content: `${glyphs.star} GRIMOIRE`,
      fg: colors.sapphire,
      backgroundColor: colors.slate,
      paddingLeft: 1,
      height: 1,
    });
    this.sidebar.add(libraryHeader);

    this.skillList = new SelectRenderable(this.renderer, {
      flexGrow: 1,
      backgroundColor: colors.obsidian,
      textColor: colors.parchment,
      selectedBackgroundColor: colors.sapphire,
      selectedTextColor: colors.void,
      focusedBackgroundColor: colors.slate,
      showDescription: true,
      descriptionColor: colors.silver,
      options: [],
      wrapSelection: true,
    });
    this.sidebar.add(this.skillList);

    // Canvas (composition graph)
    this.canvas = new BoxRenderable(this.renderer, {
      flexGrow: 1,
      flexDirection: 'column',
      backgroundColor: colors.void,
      padding: 1,
    });
    this.main.add(this.canvas);

    // Canvas header
    const canvasHeader = new TextRenderable(this.renderer, {
      content: `${glyphs.sparkle} COMPOSITION`,
      fg: colors.arcane,
      backgroundColor: 'transparent',
      height: 1,
    });
    this.canvas.add(canvasHeader);

    // Graph view
    this.graphView = new ScrollBoxRenderable(this.renderer, {
      flexGrow: 1,
      backgroundColor: colors.obsidian,
      border: true,
      borderStyle: 'rounded',
      borderColor: colors.slate,
      scrollY: true,
    });
    this.canvas.add(this.graphView);

    // Welcome message
    const welcomeText = new TextRenderable(this.renderer, {
      content: `
${glyphs.sparkle} Welcome to the Arcane Skill Forge ${glyphs.sparkle}

Press ? for help, : for commands

QUICK START:
  ${glyphs.arrow} g  Open Grimoire (skill library)
  ${glyphs.arrow} b  Open Bazaar (marketplace)
  ${glyphs.arrow} s  Inscribe new spell
  ${glyphs.arrow} p  Pipe spells together
  ${glyphs.arrow} a  Parallel execution
  ${glyphs.arrow} f  Fork on condition
  ${glyphs.arrow} c  Compile composition

${flavorText.welcome}
      `.trim(),
      fg: colors.silver,
      paddingLeft: 2,
      paddingTop: 1,
    });
    this.graphView.add(welcomeText);

    // Status bar
    this.statusBar = new BoxRenderable(this.renderer, {
      height: 1,
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.obsidian,
      paddingLeft: 1,
      paddingRight: 1,
      borderColor: colors.slate,
      border: ['top'],
    });
    this.root.add(this.statusBar);

    this.statusText = new TextRenderable(this.renderer, {
      content: flavorText.welcome,
      fg: colors.silver,
      flexGrow: 1,
    });
    this.statusBar.add(this.statusText);

    // Command line
    this.commandLine = new BoxRenderable(this.renderer, {
      height: 1,
      flexShrink: 0,
      backgroundColor: colors.void,
      paddingLeft: 1,
      visible: false,
    });
    this.root.add(this.commandLine);

    const commandPrompt = new TextRenderable(this.renderer, {
      content: ':',
      fg: colors.gold,
      width: 1,
    });
    this.commandLine.add(commandPrompt);

    this.commandInput = new InputRenderable(this.renderer, {
      flexGrow: 1,
      backgroundColor: colors.void,
      textColor: colors.parchment,
      focusedBackgroundColor: colors.void,
      focusedTextColor: colors.parchment,
      placeholder: 'Enter incantation...',
      placeholderColor: colors.ghost,
      cursorColor: colors.gold,
    });
    this.commandLine.add(this.commandInput);

    // Help overlay (hidden by default)
    this.helpOverlay = new BoxRenderable(this.renderer, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(13, 17, 23, 0.95)',
      padding: 2,
      visible: false,
      zIndex: 100,
    });
    root.add(this.helpOverlay);

    const helpContent = new ScrollBoxRenderable(this.renderer, {
      flexGrow: 1,
      backgroundColor: colors.obsidian,
      border: true,
      borderStyle: 'double',
      borderColor: colors.arcane,
      scrollY: true,
    });
    this.helpOverlay.add(helpContent);

    const helpText = new TextRenderable(this.renderer, {
      content: HELP_TEXT,
      fg: colors.parchment,
      paddingLeft: 1,
      paddingTop: 1,
    });
    helpContent.add(helpText);
  }

  /** Bind event handlers */
  private bindEvents(): void {
    // Global key handler
    this.renderer.keyInput.on('keypress', (key: KeyEvent) => {
      this.handleKey(key);
    });

    // Command input events
    this.commandInput.on('enter', async () => {
      const cmd = this.commandInput.value;
      this.commandInput.value = '';
      this.commandLine.visible = false;
      this.store.dispatch({ type: 'SET_INPUT_MODE', mode: 'normal' });
      await executeCommand(this.store, cmd);
    });

    // Selection events
    this.skillList.on('itemSelected', () => {
      const selected = this.skillList.getSelectedOption();
      if (selected) {
        this.store.dispatch({
          type: 'SET_STATUS',
          message: `Selected: ${selected.name}`,
        });
      }
    });

    this.workspaceList.on('itemSelected', () => {
      const selected = this.workspaceList.getSelectedOption();
      if (selected) {
        this.store.dispatch({
          type: 'SET_STATUS',
          message: `Using: ${selected.name}`,
        });
      }
    });
  }

  /** Handle keyboard input */
  private handleKey(key: KeyEventType): void {
    const state = this.store.getState();

    // Help overlay takes precedence
    if (state.showHelp) {
      if (key.name === 'escape' || key.name === 'q' || key.name === '?') {
        this.store.dispatch({ type: 'TOGGLE_HELP' });
        return;
      }
      return;
    }

    // Command mode
    if (state.inputMode === 'command') {
      if (key.name === 'escape') {
        this.commandLine.visible = false;
        this.store.dispatch({ type: 'SET_INPUT_MODE', mode: 'normal' });
        this.commandInput.value = '';
        return;
      }
      // Let the input handle other keys
      return;
    }

    // Normal mode - check hotkeys
    const handled = handleHotkey(this.store, key.name ?? key.raw ?? '', {
      shift: key.shift,
      ctrl: key.ctrl,
      alt: key.meta,
    });

    if (!handled) {
      // Handle specific keys not in hotkey map
      if (key.name === 'tab') {
        // Cycle focus between panels
        const panels: AppState['focusedPanel'][] = ['sidebar', 'canvas', 'command'];
        const currentIndex = panels.indexOf(state.focusedPanel);
        const nextIndex = (currentIndex + 1) % panels.length;
        const nextPanel = panels[nextIndex];
        if (nextPanel) {
          this.store.dispatch({ type: 'SET_FOCUS', panel: nextPanel });
        }
      }
    }
  }

  /** Render based on state */
  private render(state: AppState): void {
    // Update mode indicator
    const mode = modeIndicators[state.inputMode] ?? modeIndicators.normal;
    this.modeIndicator.content = `${glyphs.sparkle} ${mode.text}`;
    // Note: Would need to update color through a different mechanism

    // Update status
    if (state.errorMessage) {
      this.statusText.content = `${glyphs.cross} ${state.errorMessage}`;
    } else {
      this.statusText.content = state.statusMessage;
    }

    // Show/hide command line
    if (state.inputMode === 'command') {
      this.commandLine.visible = true;
      this.commandInput.focus();
    } else {
      this.commandLine.visible = false;
    }

    // Show/hide help
    this.helpOverlay.visible = state.showHelp;

    // Update workspace list
    this.workspaceList.options = state.installedSkills.map((skill) => ({
      name: skill.alias ?? skill.name,
      description: `${glyphs.spell} ${skill.source}`,
      value: skill.id,
    }));

    // Update skill library
    this.skillList.options = state.localSkills.map((skill) => ({
      name: skill.name,
      description: skill.description ?? skill.path,
      value: skill.path,
    }));

    // Request render
    this.renderer.requestRender();
  }

  /** Cleanup */
  destroy(): void {
    this.renderer.destroy();
  }
}

/** Start the application */
export async function startApp(): Promise<void> {
  const app = new SkillixerApp();

  process.on('SIGINT', () => {
    app.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    app.destroy();
    process.exit(0);
  });

  await app.start();
}
