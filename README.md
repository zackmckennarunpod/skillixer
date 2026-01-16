# Skillixer

> Like an elixir for skills — compose simple building blocks into powerful agent workflows

Skillixer is a TypeScript DSL for composing agent skills into **SKILL.md** files. Instead of writing monolithic skills or copy-pasting sections together, you define small, focused skills and compose them functionally.

**The key innovation:** An agent-based compiler that *understands* your composition and synthesizes coherent prose — not mechanical concatenation.

**Output:** A single, well-structured SKILL.md file ready to use with Claude Code or any agent that uses markdown skills.

## Installation

```bash
bun add skillixer
# or
npm install skillixer
```

## Quick Start

Create a file called `investigation.forge.ts`:

```typescript
import { skill, pipe, parallel } from 'skillixer';

// Define focused skills
const searchLogs = skill({
  name: 'search-logs',
  instructions: `Search application logs for errors.

  1. Identify time range
  2. Filter by error level
  3. Look for patterns`
});

const searchMetrics = skill({
  name: 'search-metrics',
  instructions: `Check system metrics for anomalies.

  - CPU and memory
  - Request latency
  - Error rates`
});

const analyze = skill({
  name: 'analyze',
  instructions: `Correlate findings to identify root cause.

  1. Build timeline
  2. Match errors with metrics
  3. Identify trigger event`
});

// Compose them: gather in parallel, then analyze
export default pipe(
  parallel(searchLogs, searchMetrics),
  analyze
);
```

Run the build:

```bash
skillixer build investigation.forge.ts -o ./skills
```

**Output:** `./skills/investigation.md` — a coherent skill document:

```markdown
---
name: investigation
description: ...
---

# Investigation

Investigate issues by gathering evidence and analyzing findings.

## Evidence Gathering

Begin by simultaneously collecting information from multiple sources:

**Search Application Logs:**
1. Identify time range of interest
2. Filter by error level
3. Look for patterns and recurring issues

**Check System Metrics:**
- CPU and memory utilization
- Request latency trends
- Error rates and anomalies

## Analysis

After gathering evidence, correlate findings to identify root cause:

1. Build a timeline of events
2. Match error patterns with metrics anomalies
3. Identify the trigger event
```

The compiler understands that `parallel()` means "do together" and creates natural prose that flows.

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
// Same building blocks → different workflows
const quickTriage = pipe(parallel(logs, metrics), analyze);
const deepDive = pipe(logs, metrics, analyze, document);
const autoResponse = pipe(parallel(logs, metrics), analyze, fork({...}));
```

### How It Works

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
│    SKILL.md     │   Ready-to-use skill document
└─────────────────┘
```

## CLI Commands

```bash
# Compile a .forge.ts file → SKILL.md
skillixer build workflow.forge.ts

# Output to specific directory
skillixer build workflow.forge.ts -o ./skills

# Preview without writing (dry-run)
skillixer preview workflow.forge.ts

# Watch mode - rebuild on changes
skillixer watch workflow.forge.ts

# Interactive wizard - Claude helps you compose
skillixer wizard

# Install a skill from GitHub
skillixer add github:org/repo/path/skill.md
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
const prodDatadog = hydrate(datadogSearch, {
  environment: 'production',
  services: ['api', 'web', 'worker'],
  defaultTimeRange: '2h'
});

export default pipe(prodDatadog, analyze);
```

### Same Skills → Different Workflows

```typescript
// Base skills
const logs = skill({ name: 'logs', instructions: '...' });
const metrics = skill({ name: 'metrics', instructions: '...' });
const analyze = skill({ name: 'analyze', instructions: '...' });
const alert = skill({ name: 'alert', instructions: '...' });
const document = skill({ name: 'document', instructions: '...' });

// Quick triage (fast, parallel)
export const quickTriage = pipe(parallel(logs, metrics), analyze);

// Deep investigation (thorough, sequential)
export const deepInvestigation = pipe(logs, metrics, analyze, document);

// Auto-response (with conditional alerting)
export const autoResponse = pipe(
  parallel(logs, metrics),
  analyze,
  fork({ when: 'severity >= "warning"', then: alert, else: document })
);
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

const datadogSearch = await importGitHub('org/repo/skills/datadog-search.md');
const specificVersion = await importGitHub('org/repo/skills/search.md@v1.0.0');
```

### From Any Git Repo

```typescript
import { importGit } from 'skillixer';

const mySkill = await importGit('git:https://gitlab.com/org/repo.git/skills/my-skill.md');
```

## API Reference

### `skill(definition)`

```typescript
const mySkill = skill({
  name: 'my-skill',           // Required
  description: 'What it does', // Optional
  instructions: `...`,         // Required
  metadata: { version: '1.0' } // Optional
});
```

### `pipe(...nodes)`

Sequential — each builds on the previous:

```typescript
pipe(gather, analyze, report)
```

### `parallel(...nodes)`

Concurrent — all run "together":

```typescript
parallel(searchA, searchB, searchC)
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

Inject configuration:

```typescript
hydrate(genericSearch, { service: 'payments', timeRange: '1h' })
```

### `compileWithAgent(ast, options)`

Compile to SKILL.md:

```typescript
const result = await compileWithAgent(composition, {
  name: 'my-skill',
  description: 'Optional description'
});

// result.content = the SKILL.md string
// result.metadata = { model, inputTokens, outputTokens, skillCount, patterns }
```

## License

MIT
