---
name: skillforge
description: Help users create and compose agent skills using Skillforge
---

# Skillforge Assistant

Help users design, compose, and compile agent skills using the Skillforge DSL.

## When to Use This Skill

- User asks to create a new skill or workflow
- User wants to combine existing skills into a composite
- User needs help structuring a multi-step agent process
- User mentions "skillforge", "compose skills", or "forge a skill"

## Skillforge Concepts

### Core Composition Operators

1. **`skill()`** - Define an inline skill
   ```typescript
   const mySkill = skill({
     name: 'my-skill',
     description: 'What it does',
     instructions: `Detailed instructions for Claude...`
   });
   ```

2. **`pipe()`** - Sequential execution (each builds on previous)
   ```typescript
   pipe(gatherData, analyzeData, summarize)
   // gatherData → analyzeData → summarize
   ```

3. **`parallel()`** - Concurrent execution (gather multiple things at once)
   ```typescript
   parallel(searchDatadog, searchGitHub, searchSlack)
   // All three run "simultaneously"
   ```

4. **`fork()`** - Conditional branching
   ```typescript
   fork({
     when: 'severity === "critical"',
     then: alertOncall,
     else: logFinding
   })
   ```

5. **`hydrate()`** - Inject context/config into a generic skill
   ```typescript
   hydrate(datadogSearch, {
     services: ['api', 'web'],
     timeRange: '1h'
   })
   ```

## Helping Users Create Skills

### Step 1: Understand the Workflow

Ask the user:
- What is the overall goal?
- What steps are involved?
- Which steps can happen in parallel?
- Are there any conditional branches?
- What context needs to be injected?

### Step 2: Design the Composition

Map the workflow to Skillforge operators:
- Sequential steps → `pipe()`
- Independent data gathering → `parallel()`
- Decision points → `fork()`
- Reusable skills with config → `hydrate()`

### Step 3: Write the .forge.ts File

Create a file like `workflow.forge.ts`:

```typescript
import { skill, pipe, parallel, fork, hydrate } from 'skillforge';

// Define skills
const step1 = skill({
  name: 'step-1',
  instructions: `...`
});

// ... more skills ...

// Compose and export
export default pipe(
  parallel(step1, step2),
  step3,
  fork({
    when: 'condition',
    then: pathA,
    else: pathB
  })
);
```

### Step 4: Compile

```bash
skillforge build workflow.forge.ts -o ./skills
```

This produces a coherent `workflow.md` skill file.

## Example Compositions

### Simple Pipeline
```typescript
export default pipe(search, analyze, summarize);
```

### Parallel Gathering
```typescript
export default pipe(
  parallel(searchLogs, searchMetrics, searchEvents),
  correlate,
  report
);
```

### Conditional Response
```typescript
export default pipe(
  investigate,
  fork({
    when: 'isUrgent',
    then: alertTeam,
    else: createTicket
  })
);
```

### With Hydration
```typescript
export default pipe(
  hydrate(genericSearch, { service: 'payments' }),
  hydrate(genericAnalyze, { rules: './rules.yaml' }),
  summarize
);
```

## When Creating Skills

1. **Keep skills focused** - Each skill should do one thing well
2. **Be specific in instructions** - Tell Claude exactly what to do
3. **Use parallel for independent work** - Don't sequence things that can happen together
4. **Fork for decisions** - Make branching explicit
5. **Hydrate for reuse** - Make generic skills configurable

## Output

After helping the user design their composition:
1. Show them the complete `.forge.ts` file
2. Explain the composition structure
3. Provide the compile command
4. Suggest improvements or alternatives if applicable
