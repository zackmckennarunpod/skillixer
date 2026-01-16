/**
 * Example: CDC Pipeline Observability
 *
 * Composes infrastructure parsing, log searching, and analysis
 * into a unified CDC investigation skill.
 *
 * This demonstrates how to combine generic building blocks
 * with hydration for project-specific context.
 */
import { skill, pipe, parallel, hydrate, fork } from '../src/index.js';

// ============================================
// GENERIC BUILDING BLOCKS
// These are reusable across any project
// ============================================

const parseInfra = skill({
  name: 'parse-sst-infra',
  description: 'Parse SST config to understand infrastructure',
  instructions: `
Analyze the SST configuration to understand the infrastructure.

## What to Look For

1. **Data flow** - How data moves through the system
   - Kinesis streams (sources and destinations)
   - Firehose delivery streams
   - Lambda processors
   - S3 destinations

2. **Key resources**
   - Function names and handlers
   - IAM permissions
   - Environment variables
   - Linked resources

3. **Configuration**
   - Batch sizes and windows
   - Retry policies
   - Error handling

## Output

Provide a clear map of:
- Data flow diagram (text-based)
- Key Lambda functions and their roles
- Potential failure points
`,
});

const searchLogs = skill({
  name: 'search-datadog-logs',
  description: 'Search Datadog for errors and patterns',
  instructions: `
Search Datadog logs for issues related to the system.

## Search Strategy

1. **Error logs first**
   - Filter by status:error
   - Look for stack traces
   - Note timestamps

2. **Warning patterns**
   - Retries and backoffs
   - Timeout warnings
   - Resource exhaustion

3. **Correlation**
   - Match errors across services
   - Build timeline

## Query Syntax

\`\`\`
service:{{service}} status:error
service:{{service}} "timeout" OR "retry"
@error.kind:* service:{{service}}
\`\`\`

## Output

- Timeline of errors
- Error patterns and frequency
- Affected components
`,
});

const analyzeFindings = skill({
  name: 'analyze-findings',
  description: 'Correlate infrastructure and log findings',
  instructions: `
Analyze the gathered evidence to identify issues.

## Analysis Steps

1. **Match errors to components**
   - Which Lambda functions are failing?
   - What stage of the pipeline?

2. **Identify root cause**
   - Configuration issues?
   - Resource limits?
   - External dependencies?

3. **Assess impact**
   - Data loss risk
   - Downstream effects
   - Recovery options

## Output

- Root cause assessment
- Impact analysis
- Recommended actions
`,
});

const suggestFix = skill({
  name: 'suggest-fix',
  description: 'Provide actionable fix recommendations',
  instructions: `
Based on the analysis, suggest specific fixes.

## Fix Categories

1. **Configuration changes**
   - SST config updates
   - Environment variables
   - Batch sizes

2. **Code changes**
   - Error handling improvements
   - Retry logic
   - Logging additions

3. **Infrastructure changes**
   - Scaling adjustments
   - Permission fixes
   - Resource additions

## Output Format

For each issue:
- File to change
- Specific change needed
- Expected outcome
`,
});

const escalate = skill({
  name: 'escalate',
  description: 'Create incident for critical issues',
  instructions: `
Create an incident report for critical findings.

Include:
- Summary of the issue
- Impact assessment
- Immediate actions taken
- Recommended next steps
- Links to relevant logs/dashboards
`,
});

// ============================================
// CDC-SPECIFIC COMPOSITION
// Hydrate generic skills with CDC context
// ============================================

// Hydrate with CDC-specific paths and services
const cdcInfraParser = hydrate(parseInfra, {
  configPath: '../cdc/sst.config.ts',
  infraPath: '../cdc/infra/',
  focus: ['Kinesis streams', 'Firehose', 'Lambda processors', 'S3 destinations'],
});

const cdcLogSearch = hydrate(searchLogs, {
  services: ['cdc-transformer', 'cdc-firehose', 'cdc-processor'],
  timeRange: '2h',
  environment: 'dev',
});

// ============================================
// COMPOSED WORKFLOW
// ============================================

export default pipe(
  // First: Understand the infrastructure
  cdcInfraParser,

  // Then: Gather evidence in parallel
  parallel(
    cdcLogSearch,
    // Could add more here: metrics, traces, etc.
  ),

  // Analyze all findings together
  analyzeFindings,

  // Branch based on severity
  fork({
    when: 'severity === "critical" || dataLossRisk === true',
    then: pipe(suggestFix, escalate),
    else: suggestFix,
  })
);

// ============================================
// ALTERNATIVE COMPOSITIONS
// Same building blocks, different workflows
// ============================================

// Quick health check (infra only)
export const quickCheck = pipe(cdcInfraParser, analyzeFindings);

// Deep investigation (everything)
export const deepInvestigation = pipe(
  cdcInfraParser,
  parallel(cdcLogSearch),
  analyzeFindings,
  suggestFix,
  escalate
);
