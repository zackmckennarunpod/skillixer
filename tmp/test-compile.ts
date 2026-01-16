/**
 * Test script - compile a simple composition to SKILL.md
 */
import { skill, pipe, parallel, fork } from '../src/index.js';
import { compileWithAgent } from '../src/compiler/index.js';
import { writeFile } from 'node:fs/promises';

// Define some simple skills
const gatherLogs = skill({
  name: 'gather-logs',
  description: 'Search application logs',
  instructions: `
Search through application logs to find relevant entries.

## Steps
1. Identify the time range of interest
2. Search for error-level logs first
3. Look for patterns and recurring issues
4. Note any stack traces or error codes

## Output
Provide a summary of findings with timestamps and severity.
`,
});

const gatherMetrics = skill({
  name: 'gather-metrics',
  description: 'Check system metrics',
  instructions: `
Review system metrics dashboards for anomalies.

## What to Check
- CPU and memory utilization
- Request latency percentiles (p50, p95, p99)
- Error rates and HTTP status codes
- Database query times

## Output
List any metrics that deviate from normal baselines.
`,
});

const analyze = skill({
  name: 'analyze',
  description: 'Correlate findings',
  instructions: `
Take the gathered evidence and identify probable root cause.

## Analysis Process
1. Build a timeline of events
2. Correlate metrics anomalies with log errors
3. Identify the "first bad" signal
4. Assess confidence level (high/medium/low)

## Output
Provide root cause hypothesis with confidence level.
`,
});

const alert = skill({
  name: 'alert-team',
  description: 'Alert on-call',
  instructions: `
Alert the on-call engineer with findings.

Post to #incidents channel with:
- Brief summary
- Root cause hypothesis
- Recommended action
`,
});

const logFindings = skill({
  name: 'log-findings',
  description: 'Log for later review',
  instructions: `
Record findings in the incident log for future reference.
No immediate action required.
`,
});

// Compose them
const composition = pipe(
  parallel(gatherLogs, gatherMetrics),
  analyze,
  fork({
    when: 'confidence === "high" && severity >= "warning"',
    then: alert,
    else: logFindings,
  })
);

// Compile!
async function main() {
  console.log('🧪 Testing skillixer compiler...\n');

  try {
    const result = await compileWithAgent(composition, {
      name: 'incident-investigator',
      description: 'Investigate production incidents by gathering evidence and taking action',
    });

    // Write to tmp folder
    const outPath = './tmp/incident-investigator.md';
    await writeFile(outPath, result.content);

    console.log('✅ Compilation successful!\n');
    console.log('📊 Stats:');
    console.log(`   Model: ${result.metadata.model}`);
    console.log(`   Skills: ${result.metadata.skillCount}`);
    console.log(`   Patterns: ${result.metadata.patterns.join(', ')}`);
    console.log(`   Tokens: ${result.metadata.inputTokens} in / ${result.metadata.outputTokens} out`);
    console.log(`\n📄 Output written to: ${outPath}`);
    console.log('\n--- Generated SKILL.md ---\n');
    console.log(result.content);
  } catch (error) {
    console.error('❌ Compilation failed:', error);
    process.exit(1);
  }
}

main();
