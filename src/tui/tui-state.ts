/**
 * Skillixer TUI State
 *
 * Simple, testable state management.
 *
 * Flow: Grimoire (library) → install → Workspace → compose
 */

// ============================================================================
// Types
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  path?: string;
  source: "local" | "github" | "marketplace";
}

export type CompositionType = "pipe" | "parallel" | "fork" | "skill";

export interface CompositionNode {
  type: CompositionType;
  skill?: Skill;
  children?: CompositionNode[];
  condition?: string;
}

export type Mode = "main" | "grimoire" | "workspace" | "compose" | "search" | "help";

export interface State {
  mode: Mode;
  selectedIndex: number;
  workspace: Skill[];
  localSkills: Skill[];
  composition: CompositionNode | null;
  statusMessage: string;
  searchQuery: string;
  searchResults: Skill[];
}

// ============================================================================
// Actions
// ============================================================================

export type Action =
  | { type: "NAVIGATE"; direction: "up" | "down" }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SELECT" }
  | { type: "INSTALL_SKILL" }
  | { type: "REMOVE_SKILL" }
  | { type: "ADD_TO_COMPOSITION"; compositionType: CompositionType }
  | { type: "CLEAR_COMPOSITION" }
  | { type: "SEARCH_INPUT"; char: string }
  | { type: "SEARCH_BACKSPACE" }
  | { type: "SEARCH_SUBMIT" }
  | { type: "SET_STATUS"; message: string }
  | { type: "BACK" }
  | { type: "QUIT" };

// Aliases for backward compatibility with tests
export { Action as ActionType };
export const SUMMON_SKILL = "INSTALL_SKILL";
export const BANISH_SKILL = "REMOVE_SKILL";

// ============================================================================
// State Factory
// ============================================================================

export function createState(localSkills: Skill[] = []): State {
  return {
    mode: "main",
    selectedIndex: 0,
    workspace: [],
    localSkills,
    composition: null,
    statusMessage: "Welcome to Skillixer",
    searchQuery: "",
    searchResults: [],
  };
}

// ============================================================================
// Selectors
// ============================================================================

export function getMaxIndex(state: State): number {
  switch (state.mode) {
    case "main":
      return 4; // 5 menu items (0-4)
    case "grimoire":
      return Math.max(0, state.localSkills.length - 1);
    case "workspace":
      return Math.max(0, state.workspace.length - 1);
    case "search":
      return Math.max(0, state.searchResults.length - 1);
    case "compose":
      return 0;
    default:
      return 0;
  }
}

export function getSelectedSkill(state: State): Skill | null {
  switch (state.mode) {
    case "grimoire":
      return state.localSkills[state.selectedIndex] ?? null;
    case "workspace":
      return state.workspace[state.selectedIndex] ?? null;
    case "search":
      return state.searchResults[state.selectedIndex] ?? null;
    default:
      return null;
  }
}

export function isSkillInWorkspace(state: State, skillId: string): boolean {
  return state.workspace.some((s) => s.id === skillId);
}

// ============================================================================
// Reducer
// ============================================================================

export function reducer(state: State, action: Action): State {
  // Handle legacy action types from tests
  const actionType = action.type === "SUMMON_SKILL" ? "INSTALL_SKILL"
                   : action.type === "BANISH_SKILL" ? "REMOVE_SKILL"
                   : action.type;

  switch (actionType) {
    case "NAVIGATE": {
      const maxIndex = getMaxIndex(state);
      const dir = (action as { direction: "up" | "down" }).direction;
      let newIndex: number;

      if (dir === "down") {
        newIndex = Math.min(state.selectedIndex + 1, maxIndex);
      } else {
        newIndex = Math.max(state.selectedIndex - 1, 0);
      }

      return { ...state, selectedIndex: newIndex };
    }

    case "SET_MODE": {
      const mode = (action as { mode: Mode }).mode;
      return {
        ...state,
        mode,
        selectedIndex: 0,
        statusMessage: getModeMessage(mode),
        ...(mode === "search" ? { searchQuery: "", searchResults: [] } : {}),
      };
    }

    case "BACK": {
      if (state.mode === "main") return state;
      return {
        ...state,
        mode: "main",
        selectedIndex: 0,
        statusMessage: "Back to main",
      };
    }

    case "INSTALL_SKILL": {
      if (state.mode !== "grimoire" && state.mode !== "search") return state;

      const skill = getSelectedSkill(state);
      if (!skill) return { ...state, statusMessage: "No skill selected" };
      if (isSkillInWorkspace(state, skill.id)) {
        return { ...state, statusMessage: `${skill.name} already installed` };
      }

      return {
        ...state,
        workspace: [...state.workspace, skill],
        statusMessage: `✓ Installed ${skill.name}`,
      };
    }

    case "REMOVE_SKILL": {
      if (state.mode !== "workspace") return state;
      if (state.workspace.length === 0) {
        return { ...state, statusMessage: "Workspace is empty" };
      }

      const skill = state.workspace[state.selectedIndex];
      if (!skill) return state;

      const newWorkspace = state.workspace.filter((_, i) => i !== state.selectedIndex);
      const newIndex = Math.min(state.selectedIndex, Math.max(0, newWorkspace.length - 1));

      return {
        ...state,
        workspace: newWorkspace,
        selectedIndex: newIndex,
        statusMessage: `✗ Removed ${skill.name}`,
      };
    }

    case "ADD_TO_COMPOSITION": {
      if (state.mode !== "grimoire" && state.mode !== "workspace") return state;

      const skill = getSelectedSkill(state);
      if (!skill) return { ...state, statusMessage: "No skill selected" };

      const compType = (action as { compositionType: CompositionType }).compositionType;
      const skillNode: CompositionNode = { type: "skill", skill };
      let newComp: CompositionNode;

      if (!state.composition) {
        newComp = { type: compType, children: [skillNode] };
      } else if (state.composition.type === compType) {
        newComp = { ...state.composition, children: [...(state.composition.children || []), skillNode] };
      } else {
        newComp = { type: compType, children: [state.composition, skillNode] };
      }

      const labels = { pipe: "pipe", parallel: "parallel", fork: "fork" };
      return {
        ...state,
        composition: newComp,
        mode: "compose",
        statusMessage: `Added ${skill.name} to ${labels[compType]}`,
      };
    }

    case "CLEAR_COMPOSITION": {
      return { ...state, composition: null, statusMessage: "Composition cleared" };
    }

    case "SEARCH_INPUT": {
      if (state.mode !== "search") return state;
      return { ...state, searchQuery: state.searchQuery + (action as { char: string }).char };
    }

    case "SEARCH_BACKSPACE": {
      if (state.mode !== "search") return state;
      return { ...state, searchQuery: state.searchQuery.slice(0, -1) };
    }

    case "SEARCH_SUBMIT": {
      if (state.mode !== "search" || !state.searchQuery) return state;
      const q = state.searchQuery;
      const results: Skill[] = [
        { id: `gh-${Date.now()}-1`, name: `${q}-skill`, description: `A skill for ${q}`, source: "github" },
        { id: `gh-${Date.now()}-2`, name: `${q}-utils`, description: `${q} utilities`, source: "github" },
        { id: `gh-${Date.now()}-3`, name: `${q}-pro`, description: `Professional ${q}`, source: "github" },
      ];
      return { ...state, searchResults: results, selectedIndex: 0, statusMessage: `Found ${results.length} results` };
    }

    case "SET_STATUS": {
      return { ...state, statusMessage: (action as { message: string }).message };
    }

    case "SELECT": {
      return handleSelect(state);
    }

    case "QUIT": {
      return state;
    }

    default:
      return state;
  }
}

function handleSelect(state: State): State {
  switch (state.mode) {
    case "main": {
      const modes: Mode[] = ["grimoire", "workspace", "search", "compose", "help"];
      const target = modes[state.selectedIndex];
      if (target) return reducer(state, { type: "SET_MODE", mode: target });
      return state;
    }
    case "grimoire":
    case "search":
      return reducer(state, { type: "INSTALL_SKILL" });
    case "workspace": {
      const skill = getSelectedSkill(state);
      if (skill) return { ...state, statusMessage: `${skill.name} selected - use p/a/f to compose` };
      return state;
    }
    default:
      return state;
  }
}

function getModeMessage(mode: Mode): string {
  const msgs: Record<Mode, string> = {
    main: "Welcome to Skillixer",
    grimoire: "Skill library - press i to install",
    workspace: "Your installed skills",
    compose: "Build your composition",
    search: "Search for skills",
    help: "Help",
  };
  return msgs[mode];
}

// ============================================================================
// Key Mapping
// ============================================================================

export function keyToAction(key: string, state: State): Action | null {
  // Exit signals
  if (key === "\u0003") return null; // Ctrl+C
  if (key === "q" && state.mode !== "search") return { type: "QUIT" };

  // Escape
  if (key === "\x1b") {
    return state.mode === "main" ? null : { type: "BACK" };
  }

  // Help mode - any key exits
  if (state.mode === "help") {
    return { type: "SET_MODE", mode: "main" };
  }

  // Search mode
  if (state.mode === "search") {
    return handleSearchKey(key, state);
  }

  // Navigation
  if (key === "j" || key === "\x1b[B") return { type: "NAVIGATE", direction: "down" };
  if (key === "k" || key === "\x1b[A") return { type: "NAVIGATE", direction: "up" };

  // Select
  if (key === "\r" || key === "\n") return { type: "SELECT" };

  // Mode switching
  if (key === "?") return { type: "SET_MODE", mode: "help" };
  if (key === "g") return { type: "SET_MODE", mode: "grimoire" };
  if (key === "w") return { type: "SET_MODE", mode: "workspace" };
  if (key === "/") return { type: "SET_MODE", mode: "search" };
  if (key === "c") return { type: "SET_MODE", mode: "compose" };

  // Skills & Composition (in grimoire or workspace)
  if (state.mode === "grimoire" || state.mode === "workspace") {
    if (key === "i" && state.mode === "grimoire") return { type: "INSTALL_SKILL" };
    if (key === "x" && state.mode === "workspace") return { type: "REMOVE_SKILL" };
    if (key === "p") return { type: "ADD_TO_COMPOSITION", compositionType: "pipe" };
    if (key === "a") return { type: "ADD_TO_COMPOSITION", compositionType: "parallel" };
    if (key === "f") return { type: "ADD_TO_COMPOSITION", compositionType: "fork" };
  }

  return null;
}

function handleSearchKey(key: string, state: State): Action | null {
  if (key === "\x1b") return { type: "BACK" };
  if (key === "\u007f" || key === "\b") return { type: "SEARCH_BACKSPACE" };
  if (key === "\r" || key === "\n") return { type: "SEARCH_SUBMIT" };

  if (state.searchResults.length > 0) {
    if (key === "j" || key === "\x1b[B") return { type: "NAVIGATE", direction: "down" };
    if (key === "k" || key === "\x1b[A") return { type: "NAVIGATE", direction: "up" };
    if (key === "i") return { type: "INSTALL_SKILL" };
  }

  if (key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) < 127) {
    return { type: "SEARCH_INPUT", char: key };
  }

  return null;
}
