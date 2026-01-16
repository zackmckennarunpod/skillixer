/**
 * TUI State Tests
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

const mockSkills: Skill[] = [
  { id: "1", name: "code-review", description: "Review code", source: "local" },
  { id: "2", name: "test-writer", description: "Write tests", source: "local" },
  { id: "3", name: "doc-gen", description: "Generate docs", source: "local" },
];

describe("State", () => {
  test("createState with defaults", () => {
    const s = createState([]);
    expect(s.mode).toBe("main");
    expect(s.selectedIndex).toBe(0);
    expect(s.workspace).toEqual([]);
  });

  test("createState with skills", () => {
    const s = createState(mockSkills);
    expect(s.localSkills).toEqual(mockSkills);
  });

  test("getMaxIndex for main", () => {
    const s = createState([]);
    expect(getMaxIndex(s)).toBe(4); // 5 items
  });

  test("getMaxIndex for grimoire", () => {
    const s = createState(mockSkills);
    s.mode = "grimoire";
    expect(getMaxIndex(s)).toBe(2); // 3 skills
  });

  test("getSelectedSkill in grimoire", () => {
    const s = createState(mockSkills);
    s.mode = "grimoire";
    s.selectedIndex = 1;
    expect(getSelectedSkill(s)).toEqual(mockSkills[1]);
  });
});

describe("Navigation", () => {
  let state: State;
  beforeEach(() => { state = createState(mockSkills); });

  test("j navigates down", () => {
    const action = keyToAction("j", state);
    expect(action).toEqual({ type: "NAVIGATE", direction: "down" });
    const s = reducer(state, action!);
    expect(s.selectedIndex).toBe(1);
  });

  test("k navigates up", () => {
    state.selectedIndex = 2;
    const action = keyToAction("k", state);
    const s = reducer(state, action!);
    expect(s.selectedIndex).toBe(1);
  });

  test("arrow down", () => {
    expect(keyToAction("\x1b[B", state)).toEqual({ type: "NAVIGATE", direction: "down" });
  });

  test("arrow up", () => {
    expect(keyToAction("\x1b[A", state)).toEqual({ type: "NAVIGATE", direction: "up" });
  });

  test("stops at top", () => {
    const s = reducer(state, { type: "NAVIGATE", direction: "up" });
    expect(s.selectedIndex).toBe(0);
  });

  test("stops at bottom", () => {
    state.selectedIndex = 4;
    const s = reducer(state, { type: "NAVIGATE", direction: "down" });
    expect(s.selectedIndex).toBe(4);
  });
});

describe("Mode Switching", () => {
  let state: State;
  beforeEach(() => { state = createState(mockSkills); });

  test("g → grimoire", () => {
    const action = keyToAction("g", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "grimoire" });
    const s = reducer(state, action!);
    expect(s.mode).toBe("grimoire");
  });

  test("w → workspace", () => {
    const s = reducer(state, keyToAction("w", state)!);
    expect(s.mode).toBe("workspace");
  });

  test("/ → search", () => {
    const s = reducer(state, keyToAction("/", state)!);
    expect(s.mode).toBe("search");
  });

  test("? → help", () => {
    const s = reducer(state, keyToAction("?", state)!);
    expect(s.mode).toBe("help");
  });

  test("c → compose", () => {
    const s = reducer(state, keyToAction("c", state)!);
    expect(s.mode).toBe("compose");
  });

  test("Esc goes back", () => {
    state.mode = "grimoire";
    const action = keyToAction("\x1b", state);
    expect(action).toEqual({ type: "BACK" });
    const s = reducer(state, action!);
    expect(s.mode).toBe("main");
  });

  test("Esc in main does nothing", () => {
    expect(keyToAction("\x1b", state)).toBeNull();
  });

  test("any key exits help", () => {
    state.mode = "help";
    const action = keyToAction("x", state);
    expect(action).toEqual({ type: "SET_MODE", mode: "main" });
  });
});

describe("Install Skill", () => {
  let state: State;
  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "grimoire";
  });

  test("i installs skill", () => {
    const action = keyToAction("i", state);
    expect(action).toEqual({ type: "INSTALL_SKILL" });
  });

  test("adds to workspace", () => {
    const s = reducer(state, { type: "INSTALL_SKILL" });
    expect(s.workspace).toHaveLength(1);
    expect(s.workspace[0]).toEqual(mockSkills[0]);
  });

  test("shows message", () => {
    const s = reducer(state, { type: "INSTALL_SKILL" });
    expect(s.statusMessage).toContain("Installed");
  });

  test("prevents duplicates", () => {
    state.workspace = [mockSkills[0]!];
    const s = reducer(state, { type: "INSTALL_SKILL" });
    expect(s.workspace).toHaveLength(1);
    expect(s.statusMessage).toContain("already");
  });

  test("Enter installs", () => {
    const s = reducer(state, keyToAction("\r", state)!);
    expect(s.workspace).toHaveLength(1);
  });

  test("i in main does nothing", () => {
    state.mode = "main";
    expect(keyToAction("i", state)).toBeNull();
  });
});

describe("Remove Skill", () => {
  let state: State;
  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "workspace";
    state.workspace = [mockSkills[0]!, mockSkills[1]!];
  });

  test("x removes skill", () => {
    const action = keyToAction("x", state);
    expect(action).toEqual({ type: "REMOVE_SKILL" });
  });

  test("removes from workspace", () => {
    const s = reducer(state, { type: "REMOVE_SKILL" });
    expect(s.workspace).toHaveLength(1);
    expect(s.workspace[0]).toEqual(mockSkills[1]);
  });

  test("shows message", () => {
    const s = reducer(state, { type: "REMOVE_SKILL" });
    expect(s.statusMessage).toContain("Removed");
  });

  test("adjusts index", () => {
    state.selectedIndex = 1;
    const s = reducer(state, { type: "REMOVE_SKILL" });
    expect(s.selectedIndex).toBe(0);
  });

  test("empty workspace", () => {
    state.workspace = [];
    const s = reducer(state, { type: "REMOVE_SKILL" });
    expect(s.statusMessage).toContain("empty");
  });

  test("x in grimoire does nothing", () => {
    state.mode = "grimoire";
    expect(keyToAction("x", state)).toBeNull();
  });
});

describe("Composition", () => {
  let state: State;
  beforeEach(() => {
    state = createState(mockSkills);
    state.mode = "grimoire";
  });

  test("p adds to pipe", () => {
    const action = keyToAction("p", state);
    expect(action).toEqual({ type: "ADD_TO_COMPOSITION", compositionType: "pipe" });
  });

  test("a adds to parallel", () => {
    expect(keyToAction("a", state)).toEqual({ type: "ADD_TO_COMPOSITION", compositionType: "parallel" });
  });

  test("f adds to fork", () => {
    expect(keyToAction("f", state)).toEqual({ type: "ADD_TO_COMPOSITION", compositionType: "fork" });
  });

  test("creates composition", () => {
    const s = reducer(state, { type: "ADD_TO_COMPOSITION", compositionType: "pipe" });
    expect(s.composition).not.toBeNull();
    expect(s.composition?.type).toBe("pipe");
    expect(s.composition?.children).toHaveLength(1);
  });

  test("appends to same type", () => {
    let s = reducer(state, { type: "ADD_TO_COMPOSITION", compositionType: "pipe" });
    s.mode = "grimoire";
    s.selectedIndex = 1;
    s = reducer(s, { type: "ADD_TO_COMPOSITION", compositionType: "pipe" });
    expect(s.composition?.children).toHaveLength(2);
  });

  test("wraps different type", () => {
    let s = reducer(state, { type: "ADD_TO_COMPOSITION", compositionType: "pipe" });
    s.mode = "grimoire";
    s.selectedIndex = 1;
    s = reducer(s, { type: "ADD_TO_COMPOSITION", compositionType: "parallel" });
    expect(s.composition?.type).toBe("parallel");
    expect(s.composition?.children?.[0]?.type).toBe("pipe");
  });

  test("switches to compose mode", () => {
    const s = reducer(state, { type: "ADD_TO_COMPOSITION", compositionType: "pipe" });
    expect(s.mode).toBe("compose");
  });

  test("p/a/f in main do nothing", () => {
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
  });

  test("typing adds to query", () => {
    let s = reducer(state, { type: "SEARCH_INPUT", char: "t" });
    s = reducer(s, { type: "SEARCH_INPUT", char: "e" });
    expect(s.searchQuery).toBe("te");
  });

  test("backspace removes", () => {
    state.searchQuery = "test";
    const s = reducer(state, { type: "SEARCH_BACKSPACE" });
    expect(s.searchQuery).toBe("tes");
  });

  test("Enter submits", () => {
    state.searchQuery = "test";
    const s = reducer(state, { type: "SEARCH_SUBMIT" });
    expect(s.searchResults.length).toBeGreaterThan(0);
  });

  test("j/k navigate results", () => {
    state.searchQuery = "test";
    let s = reducer(state, { type: "SEARCH_SUBMIT" });
    s = reducer(s, keyToAction("j", s)!);
    expect(s.selectedIndex).toBe(1);
  });

  test("i installs result", () => {
    state.searchQuery = "test";
    let s = reducer(state, { type: "SEARCH_SUBMIT" });
    s = reducer(s, { type: "INSTALL_SKILL" });
    expect(s.workspace).toHaveLength(1);
  });
});

describe("Select", () => {
  let state: State;
  beforeEach(() => { state = createState(mockSkills); });

  test("Enter on main navigates", () => {
    const s = reducer(state, keyToAction("\r", state)!);
    expect(s.mode).toBe("grimoire");
  });

  test("Enter on grimoire installs", () => {
    state.mode = "grimoire";
    const s = reducer(state, keyToAction("\r", state)!);
    expect(s.workspace).toHaveLength(1);
  });

  test("Enter on workspace shows message", () => {
    state.mode = "workspace";
    state.workspace = [mockSkills[0]!];
    const s = reducer(state, keyToAction("\r", state)!);
    expect(s.statusMessage).toContain("selected");
  });
});

describe("Quit", () => {
  test("q returns QUIT", () => {
    const state = createState([]);
    expect(keyToAction("q", state)).toEqual({ type: "QUIT" });
  });

  test("Ctrl+C returns null", () => {
    const state = createState([]);
    expect(keyToAction("\u0003", state)).toBeNull();
  });
});
