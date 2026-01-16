# Skillixer

> Like an elixir for skills — compose simple building blocks into powerful agent workflows

Skillixer is a TypeScript DSL for composing agent skills into compound SKILL.md files. Instead of writing monolithic skills or copy-pasting sections together, you define small, focused skills and compose them functionally.

**The key innovation:** An agent-based compiler that *understands* your composition and synthesizes coherent prose — not mechanical concatenation.

## Installation

```bash
bun add skillixer
# or
npm install skillixer
```

## Quick Start

```typescript
import { skill, pipe, parallel, fork } from 'skillixer';
import { compileWithAgent } from 'skillixer';

// Define focused skills
const gatherLogs = skill({
  name: 'gather-logs',
  instructions: `Search application logs for errors and anomalies...`
});

const gatherMetrics = skill({
  name: 'gather-metrics',
  instructions: `Check CPU, memory, latency metrics...`
});

const analyze = skill({
  name: 'analyze',
  instructions: `Correlate findings to identify root cause...`
});

// Compose them
const workflow = pipe(
  parallel(gatherLogs, gatherMetrics),  // Gather evidence concurrently
  analyze                                 // Then analyze
);

// Compile to SKILL.md
const result = await compileWithAgent(workflow, {
  name: 'incident-investigator',
  description: 'Investigate production incidents'
});

console.log(result.content);
```

## Core Concepts

### Composition Operators

| Operator | Purpose | Example |
|----------|---------|---------|
| `skill()` | Define an inline skill | `skill({ name: 'search', instructions: '...' })` |
| `pipe()` | Sequential execution | `pipe(gather, analyze, report)` |
| `parallel()` | Concurrent execution | `parallel(searchLogs, searchMetrics)` |
| `fork()` | Conditional branching | `fork({ when: 'isUrgent', then: alert, else: log })` |
| `hydrate()` | Inject context/config | `hydrate(search, { service: 'payments' })` |

### Why Composition?

**Without Skillixer:**
```
incident-response-datadog.skill
incident-response-github.skill
incident-response-slack.skill
incident-response-datadog-github.skill
incident-response-all.skill
... skill explosion
```

**With Skillixer:**
```typescript
// Compose from primitives
pipe(
  parallel(datadogSearch, githubSearch, slackSearch),
  correlate,
  fork({ when: 'critical', then: alertOncall, else: logFinding })
)
```

### Agent Compilation

The compiler doesn't just concatenate skills — it **understands** the composition:

```
┌─────────────────┐
│  .forge.ts DSL  │   You write functional composition
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AST (nodes)   │   pipe(), parallel(), fork(), hydrate()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent Compiler │   Claude synthesizes coherent prose
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    SKILL.md     │   Unified, well-structured skill
└─────────────────┘
```

**Mechanical merge (bad):**
```markdown
## Step 1: Search Datadog
Search logs...

## Step 2: Search GitHub
Search commits...
```

**Agent synthesis (good):**
```markdown
## Evidence Gathering

Begin by simultaneously collecting information from multiple sources:
- Search Datadog for error logs and metrics anomalies
- Check GitHub for recent deployments and commits
```

## Examples

### Simple Pipeline

```typescript
export default pipe(
  searchLogs,
  analyzeFindings,
  generateReport
);
```

### Parallel Gathering

```typescript
export default pipe(
  parallel(
    searchDatadog,
    searchGitHub,
    searchSlack
  ),
  correlateFindings,
  summarize
);
```

### Conditional Branching

```typescript
export default pipe(
  investigate,
  fork({
    when: 'severity === "critical"',
    then: pipe(alertOncall, createIncident),
    else: logFinding
  })
);
```

### With Hydration

```typescript
// Specialize a generic skill with config
const myDatadog = hydrate(datadogSearch, {
  services: ['api-gateway', 'user-service'],
  defaultTimeRange: '2h'
});

export default pipe(myDatadog, analyze);
```

## CLI

```bash
# Compile a .forge.ts file to SKILL.md
skillixer build workflow.forge.ts

# Preview without writing (dry-run)
skillixer preview workflow.forge.ts

# Output to specific directory
skillixer build workflow.forge.ts -o ./skills

# Install a skill from GitHub
skillixer add github:anthropics/skills/datadog-search.md
```

## Importing Skills

### From Local Files

```typescript
import { importLocal } from 'skillixer';

const datadogSearch = await importLocal('./skills/datadog-search.md');
```

### From GitHub

```typescript
import { importGitHub } from 'skillixer';

const datadogSearch = await importGitHub('anthropics/skills/datadog-search.md');
// Or with a specific ref
const datadogSearch = await importGitHub('anthropics/skills/datadog-search.md@v1.0.0');
```

## API Reference

### `skill(definition)`

Create an inline skill:

```typescript
const mySkill = skill({
  name: 'my-skill',           // Required
  description: 'What it does', // Optional
  instructions: `...`,         // Required - the actual skill content
  metadata: { version: '1.0' } // Optional
});
```

### `pipe(...nodes)`

Sequential composition — each skill builds on the previous:

```typescript
pipe(gather, analyze, report)
// gather → analyze → report
```

### `parallel(...nodes)`

Concurrent composition — skills run "simultaneously":

```typescript
parallel(searchA, searchB, searchC)
// All three execute concurrently, results combined
```

### `fork(options)`

Conditional branching:

```typescript
fork({
  when: 'condition expression',
  then: nodeIfTrue,
  else: nodeIfFalse  // Optional
})
```

### `hydrate(node, config)`

Inject configuration into a skill:

```typescript
hydrate(genericSearch, {
  service: 'payments',
  timeRange: '1h'
})
```

### `compileWithAgent(ast, options)`

Compile a composition to SKILL.md:

```typescript
const result = await compileWithAgent(composition, {
  name: 'my-skill',
  description: 'Optional description',
  model: 'claude-sonnet-4-20250514',  // Optional
  maxTokens: 4096                      // Optional
});

console.log(result.content);     // The SKILL.md content
console.log(result.metadata);    // { model, inputTokens, outputTokens, skillCount, patterns }
```

## License

MIT
