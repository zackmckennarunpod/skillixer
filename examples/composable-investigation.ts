/**
 * Composable Investigation Skills
 *
 * This example shows how the SAME base skills can be composed
 * into DIFFERENT workflows using skillixer's operators.
 *
 * Base skills:
 *   - searchLogs
 *   - searchMetrics
 *   - analyze
 *   - alert
 *   - document
 *
 * Composed into:
 *   1. Quick Triage (parallel search → analyze)
 *   2. Deep Investigation (sequential, thorough)
 *   3. Auto-Response (with conditional alerting)
 */
import { skill, pipe, parallel, fork, hydrate } from '../src/index.js';
import { compileWithAgent } from '../src/compiler/index.js';
import { writeFile } from 'node:fs/promises';

// ============================================
// BASE SKILLS (building blocks)
// ============================================

const searchLogs = skill({
  name: 'search-logs',
  description: 'Search application logs',
  instructions: `
Search application logs for relevant entries.

## Process
1. Identify time range of interest
2. Search error-level logs first
3. Look for patterns and stack traces
4. Note timestamps of key events

## Output
Summary with timestamps, error messages, and patterns found.
`,
});

const searchMetrics = skill({
  name: 'search-metrics',
  description: 'Check system metrics',
  instructions: `
Review system metrics for anomalies.

## Metrics to Check
- CPU and memory utilization
- Request latency (p50, p95, p99)
- Error rates
- Throughput

## Output
List of anomalies with timestamps and severity.
`,
});

const analyze = skill({
  name: 'analyze',
  description: 'Analyze findings',
  instructions: `
Correlate gathered evidence to identify root cause.

## Analysis Steps
1. Build timeline of events
2. Correlate metrics with log errors
3. Identify the trigger event
4. Assess confidence (high/medium/low)

## Output
Root cause hypothesis with confidence level.
`,
});

const alert = skill({
  name: 'alert',
  description: 'Alert on-call',
  instructions: `
Alert the on-call engineer.

Include:
- Brief summary
- Root cause (if known)
- Recommended action
- Severity level
`,
});

const document = skill({
  name: 'document',
  description: 'Document findings',
  instructions: `
Create a document of the investigation.

## Sections
- Timeline of events
- Evidence gathered
- Root cause analysis
- Lessons learned
- Prevention recommendations
`,
});

// ============================================
// COMPOSED SKILL 1: Quick Triage
// Fast, parallel evidence gathering
// ============================================
const quickTriage = pipe(
  parallel(searchLogs, searchMetrics), // Gather in parallel (fast!)
  analyze
);

// ============================================
// COMPOSED SKILL 2: Deep Investigation
// Thorough, sequential investigation
// ============================================
const deepInvestigation = pipe(
  searchLogs,      // Logs first
  searchMetrics,   // Then metrics (informed by logs)
  analyze,         // Thorough analysis
  document         // Full documentation
);

// ============================================
// COMPOSED SKILL 3: Auto-Response
// With conditional alerting
// ============================================
const autoResponse = pipe(
  parallel(searchLogs, searchMetrics),
  analyze,
  fork({
    when: 'severity >= "warning" AND confidence >= "medium"',
    then: pipe(alert, document),
    else: document
  })
);

// ============================================
// COMPOSED SKILL 4: Production-Specific
// Hydrated with prod config
// ============================================
const prodInvestigation = pipe(
  parallel(
    hydrate(searchLogs, {
      environment: 'production',
      services: ['api', 'web', 'worker'],
      defaultTimeRange: '1h'
    }),
    hydrate(searchMetrics, {
      dashboard: 'prod-overview',
      alertThreshold: 'p99 > 500ms'
    })
  ),
  analyze,
  fork({
    when: 'severity === "critical"',
    then: alert,
    else: document
  })
);

// ============================================
// Generate all variations
// ============================================
async function main() {
  console.log('🧪 Generating 4 skill variations from the same building blocks\n');

  const variations = [
    { name: 'quick-triage', desc: 'Fast parallel investigation', composition: quickTriage },
    { name: 'deep-investigation', desc: 'Thorough sequential investigation', composition: deepInvestigation },
    { name: 'auto-response', desc: 'Investigation with conditional alerting', composition: autoResponse },
    { name: 'prod-investigation', desc: 'Production-specific investigation', composition: prodInvestigation },
  ];

  for (const v of variations) {
    console.log(`📦 Compiling: ${v.name}...`);
    const result = await compileWithAgent(v.composition, {
      name: v.name,
      description: v.desc,
    });
    console.log(`   ✅ ${result.metadata.skillCount} skills, patterns: ${result.metadata.patterns.join(', ')}`);
  }

  console.log('\n🎉 Done! Same 5 base skills → 4 different workflows');
}

// Export for use as module
export { quickTriage, deepInvestigation, autoResponse, prodInvestigation };

// Run if executed directly
if (import.meta.main) {
  main();
}
