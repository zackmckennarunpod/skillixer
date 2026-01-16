/**
 * Skillixer - Application State
 *
 * Centralized state management for the TUI
 */

import type { CompositionNode, Skill } from '../core/types.js';

/** Available view modes */
export type ViewMode =
  | 'grimoire' // Main composition canvas
  | 'spellbook' // Local skill library browser
  | 'bazaar' // GitHub marketplace search
  | 'preview' // Compiled output preview
  | 'help'; // Help screen

/** Input modes (vim-style) */
export type InputMode = 'normal' | 'command' | 'insert' | 'search';

/** A skill in the library (like an installed dependency) */
export interface LibrarySkill {
  readonly name: string;
  readonly path: string;
  readonly description?: string;
  readonly source: 'local' | 'github';
  readonly installed: boolean; // Whether it's been imported to workspace
}

/** An installed skill in the workspace (ready to use in compositions) */
export interface InstalledSkill {
  readonly id: string;
  readonly name: string;
  readonly alias?: string; // Optional alias for referencing
  readonly source: LibrarySkill['source'];
  readonly sourcePath: string;
  readonly instructions: string;
  readonly metadata?: Record<string, unknown>;
}

/** A node in the visual composition graph */
export interface GraphNode {
  readonly id: string;
  readonly type: 'skill' | 'pipe' | 'parallel' | 'fork' | 'hydrate';
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly data: CompositionNode;
  readonly children: string[];
  readonly selected: boolean;
  readonly expanded: boolean;
}

/** Search result from GitHub scrying */
export interface ScryResult {
  readonly name: string;
  readonly owner: string;
  readonly repo: string;
  readonly path: string;
  readonly description?: string;
  readonly stars: number;
  readonly url: string;
}

/** The application state */
export interface AppState {
  // View state
  viewMode: ViewMode;
  inputMode: InputMode;
  commandBuffer: string;
  searchQuery: string;

  // Composition state
  composition: CompositionNode | null;
  graphNodes: GraphNode[];
  selectedNodeId: string | null;

  // Library state
  localSkills: LibrarySkill[];
  selectedSkillIndex: number;

  // Workspace - installed skills (like node_modules)
  installedSkills: InstalledSkill[];
  selectedInstalledIndex: number;

  // Marketplace state
  scryResults: ScryResult[];
  scryLoading: boolean;
  selectedResultIndex: number;

  // Preview state
  previewContent: string;

  // Status
  statusMessage: string;
  errorMessage: string | null;
  isLoading: boolean;

  // UI state
  showHelp: boolean;
  focusedPanel: 'canvas' | 'sidebar' | 'command';
}

/** Create initial state */
export function createInitialState(): AppState {
  return {
    viewMode: 'grimoire',
    inputMode: 'normal',
    commandBuffer: '',
    searchQuery: '',

    composition: null,
    graphNodes: [],
    selectedNodeId: null,

    localSkills: [],
    selectedSkillIndex: 0,

    installedSkills: [],
    selectedInstalledIndex: 0,

    scryResults: [],
    scryLoading: false,
    selectedResultIndex: 0,

    previewContent: '',

    statusMessage: 'The forge awaits your command...',
    errorMessage: null,
    isLoading: false,

    showHelp: false,
    focusedPanel: 'canvas',
  };
}

/** State update actions */
export type Action =
  | { type: 'SET_VIEW_MODE'; mode: ViewMode }
  | { type: 'SET_INPUT_MODE'; mode: InputMode }
  | { type: 'SET_COMMAND_BUFFER'; value: string }
  | { type: 'SET_SEARCH_QUERY'; value: string }
  | { type: 'SET_COMPOSITION'; composition: CompositionNode | null }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'TOGGLE_NODE_EXPAND'; nodeId: string }
  | { type: 'SET_LOCAL_SKILLS'; skills: LibrarySkill[] }
  | { type: 'SELECT_SKILL'; index: number }
  | { type: 'SET_SCRY_RESULTS'; results: ScryResult[] }
  | { type: 'SET_SCRY_LOADING'; loading: boolean }
  | { type: 'SELECT_RESULT'; index: number }
  | { type: 'SET_PREVIEW'; content: string }
  | { type: 'SET_STATUS'; message: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'TOGGLE_HELP' }
  | { type: 'SET_FOCUS'; panel: AppState['focusedPanel'] }
  | { type: 'ADD_NODE'; node: GraphNode }
  | { type: 'UPDATE_NODES'; nodes: GraphNode[] }
  | { type: 'INSTALL_SKILL'; skill: InstalledSkill }
  | { type: 'UNINSTALL_SKILL'; skillId: string }
  | { type: 'SELECT_INSTALLED'; index: number }
  | { type: 'SET_SKILL_ALIAS'; skillId: string; alias: string };

/** State reducer */
export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };

    case 'SET_INPUT_MODE':
      return { ...state, inputMode: action.mode };

    case 'SET_COMMAND_BUFFER':
      return { ...state, commandBuffer: action.value };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.value };

    case 'SET_COMPOSITION':
      return { ...state, composition: action.composition };

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.nodeId,
        graphNodes: state.graphNodes.map((n) => ({
          ...n,
          selected: n.id === action.nodeId,
        })),
      };

    case 'TOGGLE_NODE_EXPAND':
      return {
        ...state,
        graphNodes: state.graphNodes.map((n) =>
          n.id === action.nodeId ? { ...n, expanded: !n.expanded } : n,
        ),
      };

    case 'SET_LOCAL_SKILLS':
      return { ...state, localSkills: action.skills };

    case 'SELECT_SKILL':
      return { ...state, selectedSkillIndex: action.index };

    case 'SET_SCRY_RESULTS':
      return { ...state, scryResults: action.results };

    case 'SET_SCRY_LOADING':
      return { ...state, scryLoading: action.loading };

    case 'SELECT_RESULT':
      return { ...state, selectedResultIndex: action.index };

    case 'SET_PREVIEW':
      return { ...state, previewContent: action.content };

    case 'SET_STATUS':
      return { ...state, statusMessage: action.message, errorMessage: null };

    case 'SET_ERROR':
      return { ...state, errorMessage: action.error };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'TOGGLE_HELP':
      return { ...state, showHelp: !state.showHelp };

    case 'SET_FOCUS':
      return { ...state, focusedPanel: action.panel };

    case 'ADD_NODE':
      return { ...state, graphNodes: [...state.graphNodes, action.node] };

    case 'UPDATE_NODES':
      return { ...state, graphNodes: action.nodes };

    case 'INSTALL_SKILL':
      return {
        ...state,
        installedSkills: [...state.installedSkills, action.skill],
        statusMessage: `Summoned: ${action.skill.name}`,
      };

    case 'UNINSTALL_SKILL':
      return {
        ...state,
        installedSkills: state.installedSkills.filter((s) => s.id !== action.skillId),
      };

    case 'SELECT_INSTALLED':
      return { ...state, selectedInstalledIndex: action.index };

    case 'SET_SKILL_ALIAS':
      return {
        ...state,
        installedSkills: state.installedSkills.map((s) =>
          s.id === action.skillId ? { ...s, alias: action.alias } : s,
        ),
      };

    default:
      return state;
  }
}

/** Simple store implementation */
export class Store {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();

  constructor() {
    this.state = createInitialState();
  }

  getState(): AppState {
    return this.state;
  }

  dispatch(action: Action): void {
    this.state = reducer(this.state, action);
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
