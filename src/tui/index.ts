#!/usr/bin/env bun

/**
 * Skillixer TUI
 *
 * Flow: Grimoire (library) → install → Workspace → compose
 */

import {
  createState,
  reducer,
  keyToAction,
  isSkillInWorkspace,
  type State,
  type Skill,
  type CompositionNode,
} from "./tui-state";
import { searchGitHub } from "./github-search";

// Colors
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgCyan: "\x1b[46m",
  bgMagenta: "\x1b[45m",
};

// Mock skills
const SKILLS: Skill[] = [
  {
    id: "1",
    name: "code-review",
    description: "Analyze and review code",
    source: "local",
  },
  {
    id: "2",
    name: "test-writer",
    description: "Generate unit tests",
    source: "local",
  },
  {
    id: "3",
    name: "doc-gen",
    description: "Create documentation",
    source: "local",
  },
  {
    id: "4",
    name: "refactor",
    description: "Suggest refactoring",
    source: "local",
  },
  {
    id: "5",
    name: "security",
    description: "Security analysis",
    source: "local",
  },
  {
    id: "6",
    name: "perf",
    description: "Performance optimization",
    source: "local",
  },
];

const LOGO = `${c.magenta}
   _____ __   _ ____  _
  / ___// /__(_) / / (_)  _____  _____
  \\__ \\/ //_/ / / / / / |/_/ _ \\/ ___/
 ___/ / ,< / / / / / />  </  __/ /
/____/_/|_/_/_/_/_/_/_/|_|\\___/_/
${c.reset}`;

let state: State;
let isSearching = false;

function render(): void {
  console.clear();
  console.log(LOGO);

  switch (state.mode) {
    case "main":
      renderMain();
      break;
    case "grimoire":
      renderGrimoire();
      break;
    case "workspace":
      renderWorkspace();
      break;
    case "compose":
      renderCompose();
      break;
    case "search":
      renderSearch();
      break;
    case "help":
      renderHelp();
      break;
  }

  // Status bar
  console.log(`\n${c.dim}─────────────────────────────────────────${c.reset}`);
  console.log(`${c.cyan}${state.statusMessage}${c.reset}`);
}

function renderMain(): void {
  console.log(`${c.bold}Main Menu${c.reset}\n`);

  const items = [
    { key: "g", name: "Grimoire", desc: "Skill library" },
    {
      key: "w",
      name: "Workspace",
      desc: `Installed skills (${state.workspace.length})`,
    },
    { key: "/", name: "Search", desc: "Find skills on GitHub" },
    { key: "c", name: "Compose", desc: "Build skill pipeline" },
    { key: "?", name: "Help", desc: "Show all commands" },
  ];

  items.forEach((item, i) => {
    const sel = i === state.selectedIndex;
    const arrow = sel ? `${c.cyan}▸${c.reset}` : " ";
    const key = sel
      ? `${c.bgCyan}${c.bold} ${item.key} ${c.reset}`
      : `${c.cyan}[${item.key}]${c.reset}`;
    const name = sel ? `${c.bold}${c.cyan}${item.name}${c.reset}` : item.name;
    console.log(
      `  ${arrow} ${key} ${name.padEnd(20)} ${c.dim}${item.desc}${c.reset}`,
    );
  });

  console.log(`\n${c.dim}  j/k navigate · Enter select · q quit${c.reset}`);
}

function renderGrimoire(): void {
  console.log(
    `${c.bold}${c.magenta}📚 Grimoire${c.reset} ${c.dim}(skill library)${c.reset}\n`,
  );

  if (state.localSkills.length === 0) {
    console.log(`  ${c.dim}No skills available${c.reset}`);
  } else {
    state.localSkills.forEach((skill, i) => {
      const sel = i === state.selectedIndex;
      const arrow = sel ? `${c.cyan}▸${c.reset}` : " ";
      const installed = isSkillInWorkspace(state, skill.id);
      const mark = installed ? `${c.green}✓${c.reset}` : " ";
      const name = sel
        ? `${c.bold}${c.cyan}${skill.name}${c.reset}`
        : skill.name;
      console.log(
        `  ${arrow} ${mark} ${name.padEnd(18)} ${c.dim}${skill.description}${c.reset}`,
      );
    });
  }

  console.log(
    `\n${c.dim}  j/k navigate · i install · p/a/f compose · Esc back${c.reset}`,
  );
}

function renderWorkspace(): void {
  console.log(
    `${c.bold}${c.cyan}🔧 Workspace${c.reset} ${c.dim}(installed skills)${c.reset}\n`,
  );

  if (state.workspace.length === 0) {
    console.log(
      `  ${c.dim}Empty. Go to Grimoire [g] and install skills.${c.reset}`,
    );
  } else {
    state.workspace.forEach((skill, i) => {
      const sel = i === state.selectedIndex;
      const arrow = sel ? `${c.cyan}▸${c.reset}` : " ";
      const name = sel
        ? `${c.bold}${c.cyan}${skill.name}${c.reset}`
        : skill.name;
      const src = skill.source === "github" ? "  " : "📁";
      console.log(
        `  ${arrow} ${src} ${name.padEnd(18)} ${c.dim}${skill.description}${c.reset}`,
      );
    });
  }

  console.log(
    `\n${c.dim}  j/k navigate · x remove · p/a/f compose · Esc back${c.reset}`,
  );
}

function renderCompose(): void {
  console.log(
    `${c.bold}${c.yellow}⚡ Compose${c.reset} ${c.dim}(build pipeline)${c.reset}\n`,
  );

  if (!state.composition) {
    console.log(`  ${c.dim}No composition yet.${c.reset}`);
    console.log(
      `  ${c.dim}Go to Grimoire [g] or Workspace [w], select a skill,${c.reset}`,
    );
    console.log(
      `  ${c.dim}and press p (pipe), a (parallel), or f (fork).${c.reset}`,
    );
  } else {
    console.log(renderTree(state.composition, 1));
  }

  console.log(`\n${c.dim}  g grimoire · w workspace · Esc back${c.reset}`);
}

function renderTree(node: CompositionNode, depth: number): string {
  const pad = "  ".repeat(depth);
  const lines: string[] = [];

  if (node.type === "skill" && node.skill) {
    lines.push(`${pad}${c.cyan}◆${c.reset} ${node.skill.name}`);
  } else {
    const labels: Record<string, string> = {
      pipe: `${c.magenta}│ PIPE${c.reset} ${c.dim}(sequential)${c.reset}`,
      parallel: `${c.green}║ PARALLEL${c.reset} ${c.dim}(concurrent)${c.reset}`,
      fork: `${c.yellow}◇ FORK${c.reset} ${c.dim}(conditional)${c.reset}`,
    };
    lines.push(`${pad}${labels[node.type] ?? node.type}`);
    node.children?.forEach((child, i) => {
      const last = i === (node.children?.length ?? 0) - 1;
      const branch = last ? "└" : "├";
      const childLines = renderTree(child, 0).trim();
      lines.push(`${pad}  ${c.dim}${branch}${c.reset} ${childLines}`);
    });
  }

  return lines.join("\n");
}

function renderSearch(): void {
  console.log(`${c.bold}${c.magenta}🔍 Search GitHub${c.reset}\n`);
  console.log(
    `  ${c.cyan}Query:${c.reset} ${state.searchQuery}${c.dim}_${c.reset}`,
  );

  if (isSearching) {
    console.log(`\n  ${c.yellow}Searching GitHub...${c.reset}`);
  } else if (state.searchResults.length > 0) {
    console.log(`\n  ${c.dim}Results:${c.reset}`);
    state.searchResults.forEach((skill, i) => {
      const sel = i === state.selectedIndex;
      const arrow = sel ? `${c.cyan}▸${c.reset}` : " ";
      const name = sel
        ? `${c.bold}${c.cyan}${skill.name}${c.reset}`
        : skill.name;
      const desc = skill.description?.slice(0, 40) || "";
      console.log(`  ${arrow}   ${name.padEnd(20)} ${c.dim}${desc}${c.reset}`);
    });
    console.log(
      `\n${c.dim}  j/k navigate · i install · Enter open · Esc back${c.reset}`,
    );
  } else if (state.searchQuery) {
    console.log(`\n  ${c.dim}Press Enter to search GitHub${c.reset}`);
  } else {
    console.log(
      `\n  ${c.dim}Type to search · Enter to submit · Esc back${c.reset}`,
    );
  }
}

function renderHelp(): void {
  console.log(`${c.bold}Help${c.reset}\n`);
  console.log(`  ${c.cyan}Navigation${c.reset}`);
  console.log(`    j/k or ↓/↑    Move down/up`);
  console.log(`    Enter         Select`);
  console.log(`    Esc           Back`);
  console.log(`    q             Quit`);
  console.log();
  console.log(`  ${c.cyan}Views${c.reset}`);
  console.log(`    g             Grimoire (skill library)`);
  console.log(`    w             Workspace (installed)`);
  console.log(`    /             Search GitHub`);
  console.log(`    c             Compose view`);
  console.log(`    ?             This help`);
  console.log();
  console.log(`  ${c.cyan}Skills${c.reset}`);
  console.log(`    i             Install skill (in Grimoire)`);
  console.log(`    x             Remove skill (in Workspace)`);
  console.log();
  console.log(`  ${c.cyan}Compose${c.reset}`);
  console.log(`    p             Add to Pipe (sequential)`);
  console.log(`    a             Add to All (parallel)`);
  console.log(`    f             Add to Fork (conditional)`);
  console.log(`\n${c.dim}  Press any key to close${c.reset}`);
}

async function handleKey(key: string): Promise<boolean> {
  const action = keyToAction(key, state);

  if (action?.type === "QUIT" || key === "\u0003") {
    return false;
  }

  // Handle async GitHub search
  if (
    action?.type === "SEARCH_SUBMIT" &&
    state.mode === "search" &&
    state.searchQuery
  ) {
    isSearching = true;
    state = { ...state, statusMessage: "Searching GitHub..." };
    render();

    try {
      const results = await searchGitHub(state.searchQuery);
      state = {
        ...state,
        searchResults: results,
        selectedIndex: 0,
        statusMessage:
          results.length > 0
            ? `Found ${results.length} results`
            : "No results found",
      };
    } catch (err) {
      state = { ...state, statusMessage: `Search failed: ${err}` };
    }

    isSearching = false;
    render();
    return true;
  }

  if (action) {
    state = reducer(state, action);
  }

  render();
  return true;
}

async function main(): Promise<void> {
  if (!process.stdin.isTTY) {
    console.log(LOGO);
    console.log("Run in interactive terminal.");
    process.exit(0);
  }

  state = createState(SKILLS);

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  render();

  process.stdin.on("data", async (key: string) => {
    const shouldContinue = await handleKey(key);
    if (!shouldContinue) {
      console.log(`\n${c.dim}Goodbye.${c.reset}\n`);
      process.exit(0);
    }
  });
}

main().catch(console.error);
