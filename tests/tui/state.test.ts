/**
 * TUI State Management Tests
 *
 * TDD tests for Skillixer TUI state and key handling
 */

import { describe, test, expect, beforeEach } from "bun:test";
import {
  createState,
  reducer,
  keyToAction,
  getMaxIndex,
  getSelectedSkill,
  type State,
  type Skill,
} from "../../src/tui/tui-state";

// Test fixtures
const mockSkills: Skill[] = [
  {
    id: "sk-1",
    name: "code-review",
    description: "Review code",
    source: "local",
  },
  {
    id: "sk-2",
    name: "test-writer",
    description: "Write tests",
    source: "local",
  },
  {
    id: "sk-3",
    name: "doc-gen",
    description: "Generate docs",
    source: "local",
  },
];

describe("TUI State", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
  });

  describe("createState", () => {
    test("creates initial state with default values", () => {
      const s = createState([]);
      expect(s.mode).toBe("main");
      expect(s.selectedIndex).toBe(0);
      expect(s.workspace).toEqual([]);
      expect(s.composition).toBeNull();
    });

    test("accepts initial local skills", () => {
      expect(state.localSkills).toEqual(mockSkills);
    });
  });

  describe("getMaxIndex", () => {
    test("returns 7 for main menu (8 items)", () => {
      expect(getMaxIndex(state)).toBe(7);
    });

    test("returns skills length - 1 for grimoire", () => {
      state.mode = "grimoire";
      expect(getMaxIndex(state)).toBe(2); // 3 skills, max index 2
    });

    test("returns 0 for empty workspace", () => {
      state.mode = "workspace";
      expect(getMaxIndex(state)).toBe(0);
    });

    test("returns workspace length - 1 when populated", () => {
      state.mode = "workspace";
      state.workspace = [mockSkills[0]!, mockSkills[1]!];
      expect(getMaxIndex(state)).toBe(1);
    });
  });

  describe("getSelectedSkill", () => {
    test("returns null in main mode", () => {
      expect(getSelectedSkill(state)).toBeNull();
    });

    test("returns selected skill in grimoire", () => {
      state.mode = "grimoire";
      state.selectedIndex = 1;
      expect(getSelectedSkill(state)).toEqual(mockSkills[1]);
    });

    test("returns selected skill in workspace", () => {
      state.mode = "workspace";
      state.workspace = [mockSkills[0]!, mockSkills[1]!];
      state.selectedIndex = 0;
      expect(getSelectedSkill(state)).toEqual(mockSkills[0]);
    });
  });
});

describe("Navigation", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
  });

  test("j key navigates down", () => {
    const action = keyToAction("j", state);
    expect(action).toEqual({ type: "NAVIGATE", direction: "down" });

    const newState = reducer(state, action!);
    expect(newState.selectedIndex).toBe(1);
  });

  test("k key navigates up", () => {
    state.selectedIndex = 2;
    const action = keyToAction("k", state);
    expect(action).toEqual({ type: "NAVIGATE", direction: "up" });

    const newState = reducer(state, action!);
    expect(newState.selectedIndex).toBe(1);
  });

  test("down arrow navigates down", () => {
    const action = keyToAction("\x1b[B", state);
    expect(action).toEqual({ type: "NAVIGATE", direction: "down" });
  });

  test("up arrow navigates up", () => {
    const action = keyToAction("\x1b[A", state);
    expect(action).toEqual({ type: "NAVIGATE", direction: "up" });
  });

  test("navigation stops at top", () => {
    state.selectedIndex = 0;
    const newState = reducer(state, { type: "NAVIGATE", direction: "up" });
    expect(newState.selectedIndex).toBe(0);
  });

  test("navigation stops at bottom", () => {
    state.selectedIndex = 7; // max for main menu
    const newState = reducer(state, { type: "NAVIGATE", direction: "down" });
    expect(newState.selectedIndex).toBe(7);
  });

  test("navigation respects grimoire bounds", () => {
    state.mode = "grimoire";
    state.selectedIndex = 2; // last skill
    const newState = reducer(state, { type: "NAVIGATE", direction: "down" });
    expect(newState.selectedIndex).toBe(2); // stays at 2
  });
});

describe("Mode Switching", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
  });

  test("g key switches to grimoire", () => {
    const action = keyToAction("g", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "grimoire" });

    const newState = reducer(state, action!);
    expect(newState.mode).toBe("grimoire");
    expect(newState.selectedIndex).toBe(0);
  });

  test("w key switches to workspace", () => {
    const action = keyToAction("w", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "workspace" });

    const newState = reducer(state, action!);
    expect(newState.mode).toBe("workspace");
  });

  test("/ key switches to search", () => {
    const action = keyToAction("/", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "search" });

    const newState = reducer(state, action!);
    expect(newState.mode).toBe("search");
  });

  test("? key switches to help", () => {
    const action = keyToAction("?", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "help" });

    const newState = reducer(state, action!);
    expect(newState.mode).toBe("help");
  });

  test("c key switches to compose", () => {
    const action = keyToAction("c", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "compose" });

    const newState = reducer(state, action!);
    expect(newState.mode).toBe("compose");
  });

  test("Escape returns to main from grimoire", () => {
    state.mode = "grimoire";
    const action = keyToAction("\x1b", state);
    expect(action).toEqual({ type: "BACK" });

    const newState = reducer(state, action!);
    expect(newState.mode).toBe("main");
  });

  test("Escape does nothing in main mode", () => {
    state.mode = "main";
    const action = keyToAction("\x1b", state);
    expect(action).toBeNull();
  });

  test("any key exits help mode", () => {
    state.mode = "help";
    const action = keyToAction("x", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "main" });
  });
});

describe("Summon Skill (add to workspace)", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "grimoire";
    state.selectedIndex = 0;
  });

  test("i key summons skill in grimoire", () => {
    const action = keyToAction("i", state);
    expect(action).toEqual({ type: "SUMMON_SKILL" });
  });

  test("summon adds skill to workspace", () => {
    const newState = reducer(state, { type: "SUMMON_SKILL" });
    expect(newState.workspace).toHaveLength(1);
    expect(newState.workspace[0]).toEqual(mockSkills[0]);
  });

  test("summon updates status message", () => {
    const newState = reducer(state, { type: "SUMMON_SKILL" });
    expect(newState.statusMessage).toContain("Summoned");
    expect(newState.statusMessage).toContain("code-review");
  });

  test("cannot summon same skill twice", () => {
    state.workspace = [mockSkills[0]!];
    const newState = reducer(state, { type: "SUMMON_SKILL" });
    expect(newState.workspace).toHaveLength(1);
    expect(newState.statusMessage).toContain("already");
  });

  test("Enter key summons skill in grimoire", () => {
    const action = keyToAction("\r", state);
    const newState = reducer(state, action!);
    expect(newState.workspace).toHaveLength(1);
  });

  test("i key does nothing in main mode", () => {
    state.mode = "main";
    const action = keyToAction("i", state);
    expect(action).toBeNull();
  });
});

describe("Banish Skill (remove from workspace)", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "workspace";
    state.workspace = [mockSkills[0]!, mockSkills[1]!];
    state.selectedIndex = 0;
  });

  test("r key banishes skill in workspace", () => {
    const action = keyToAction("r", state);
    expect(action).toEqual({ type: "BANISH_SKILL" });
  });

  test("banish removes skill from workspace", () => {
    const newState = reducer(state, { type: "BANISH_SKILL" });
    expect(newState.workspace).toHaveLength(1);
    expect(newState.workspace[0]).toEqual(mockSkills[1]);
  });

  test("banish updates status message", () => {
    const newState = reducer(state, { type: "BANISH_SKILL" });
    expect(newState.statusMessage).toContain("Banished");
    expect(newState.statusMessage).toContain("code-review");
  });

  test("banish adjusts selectedIndex", () => {
    state.selectedIndex = 1;
    const newState = reducer(state, { type: "BANISH_SKILL" });
    expect(newState.selectedIndex).toBe(0);
  });

  test("banish last item moves selection up", () => {
    state.workspace = [mockSkills[0]!];
    state.selectedIndex = 0;
    const newState = reducer(state, { type: "BANISH_SKILL" });
    expect(newState.workspace).toHaveLength(0);
    expect(newState.selectedIndex).toBe(0);
  });

  test("r key does nothing in grimoire", () => {
    state.mode = "grimoire";
    const action = keyToAction("r", state);
    expect(action).toBeNull();
  });

  test("banish on empty workspace does nothing", () => {
    state.workspace = [];
    const newState = reducer(state, { type: "BANISH_SKILL" });
    expect(newState.workspace).toHaveLength(0);
    expect(newState.statusMessage).toContain("No skills");
  });
});

describe("Composition", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "grimoire";
    state.selectedIndex = 0;
  });

  test("p key adds to pipe composition", () => {
    const action = keyToAction("p", state);
    expect(action).toEqual({
      type: "ADD_TO_COMPOSITION",
      compositionType: "pipe",
    });
  });

  test("a key adds to parallel composition", () => {
    const action = keyToAction("a", state);
    expect(action).toEqual({
      type: "ADD_TO_COMPOSITION",
      compositionType: "parallel",
    });
  });

  test("f key adds to fork composition", () => {
    const action = keyToAction("f", state);
    expect(action).toEqual({
      type: "ADD_TO_COMPOSITION",
      compositionType: "fork",
    });
  });

  test("adding first skill creates composition", () => {
    const newState = reducer(state, {
      type: "ADD_TO_COMPOSITION",
      compositionType: "pipe",
    });
    expect(newState.composition).not.toBeNull();
    expect(newState.composition?.type).toBe("pipe");
    expect(newState.composition?.children).toHaveLength(1);
  });

  test("adding to same type appends", () => {
    let s = reducer(state, {
      type: "ADD_TO_COMPOSITION",
      compositionType: "pipe",
    });
    s.mode = "grimoire";
    s.selectedIndex = 1;
    s = reducer(s, { type: "ADD_TO_COMPOSITION", compositionType: "pipe" });

    expect(s.composition?.type).toBe("pipe");
    expect(s.composition?.children).toHaveLength(2);
  });

  test("adding different type wraps existing", () => {
    let s = reducer(state, {
      type: "ADD_TO_COMPOSITION",
      compositionType: "pipe",
    });
    s.mode = "grimoire";
    s.selectedIndex = 1;
    s = reducer(s, { type: "ADD_TO_COMPOSITION", compositionType: "parallel" });

    expect(s.composition?.type).toBe("parallel");
    expect(s.composition?.children).toHaveLength(2);
    expect(s.composition?.children?.[0]?.type).toBe("pipe");
  });

  test("composition switches to compose mode", () => {
    const newState = reducer(state, {
      type: "ADD_TO_COMPOSITION",
      compositionType: "pipe",
    });
    expect(newState.mode).toBe("compose");
  });

  test("p/a/f do nothing in main mode", () => {
    state.mode = "main";
    expect(keyToAction("p", state)).toBeNull();
    expect(keyToAction("a", state)).toBeNull();
    expect(keyToAction("f", state)).toBeNull();
  });
});

describe("Search", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "search";
    state.searchQuery = "";
  });

  test("typing adds to search query", () => {
    const action = keyToAction("t", state);
    expect(action).toEqual({ type: "SEARCH_INPUT", char: "t" });

    let s = reducer(state, action!);
    s = reducer(s, { type: "SEARCH_INPUT", char: "e" });
    s = reducer(s, { type: "SEARCH_INPUT", char: "s" });
    s = reducer(s, { type: "SEARCH_INPUT", char: "t" });

    expect(s.searchQuery).toBe("test");
  });

  test("backspace removes from search query", () => {
    state.searchQuery = "test";
    const action = keyToAction("\u007f", state);
    expect(action).toEqual({ type: "SEARCH_BACKSPACE" });

    const newState = reducer(state, action!);
    expect(newState.searchQuery).toBe("tes");
  });

  test("Enter submits search", () => {
    state.searchQuery = "test";
    const action = keyToAction("\r", state);
    expect(action).toEqual({ type: "SEARCH_SUBMIT" });

    const newState = reducer(state, action!);
    expect(newState.searchResults.length).toBeGreaterThan(0);
  });

  test("j/k navigate results after search", () => {
    state.searchQuery = "test";
    let s = reducer(state, { type: "SEARCH_SUBMIT" });

    const downAction = keyToAction("j", s);
    expect(downAction).toEqual({ type: "NAVIGATE", direction: "down" });

    s = reducer(s, downAction!);
    expect(s.selectedIndex).toBe(1);
  });

  test("i installs search result", () => {
    state.searchQuery = "test";
    let s = reducer(state, { type: "SEARCH_SUBMIT" });

    const action = keyToAction("i", s);
    expect(action).toEqual({ type: "SUMMON_SKILL" });

    s = reducer(s, action!);
    expect(s.workspace).toHaveLength(1);
  });
});

describe("Select (Enter)", () => {
  let state: State;

  beforeEach(() => {
    state = createState(mockSkills);
  });

  test("Enter on main menu navigates to mode", () => {
    state.selectedIndex = 0; // Grimoire
    const action = keyToAction("\r", state);
    const newState = reducer(state, action!);
    expect(newState.mode).toBe("grimoire");
  });

  test("Enter on grimoire summons skill", () => {
    state.mode = "grimoire";
    state.selectedIndex = 0;
    const action = keyToAction("\r", state);
    const newState = reducer(state, action!);
    expect(newState.workspace).toHaveLength(1);
  });

  test("Enter on workspace shows selection message", () => {
    state.mode = "workspace";
    state.workspace = [mockSkills[0]!];
    state.selectedIndex = 0;
    const action = keyToAction("\r", state);
    const newState = reducer(state, action!);
    expect(newState.statusMessage).toContain("Selected");
    expect(newState.statusMessage).toContain("code-review");
  });
});

describe("Quit", () => {
  test("q returns null (exit signal)", () => {
    const state = createState([]);
    const action = keyToAction("q", state);
    expect(action).toEqual({ type: "QUIT" });
  });

  test("Ctrl+C returns null (exit signal)", () => {
    const state = createState([]);
    const action = keyToAction("\u0003", state);
    expect(action).toBeNull(); // External handler
  });
});
