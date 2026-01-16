/**
 * Example: Incident Response Workflow
 *
 * This composition creates a skill that helps investigate and respond
 * to production incidents by gathering evidence from multiple sources.
 */
import { skill, pipe, parallel, fork, hydrate } from '../src/index.js';

// Define individual skills
const datadogSearch = skill({
  name: 'datadog-search',
  description: 'Search Datadog for logs and metrics',
  instructions: `
Search Datadog for relevant information about the incident.

## What to Search For

1. **Error logs** in the affected service
   - Filter by service name and error level
   - Look for stack traces and error messages
   - Note timestamps of first occurrence

2. **Metrics anomalies**
   - Check CPU, memory, and request latency
   - Look for sudden spikes or drops
   - Compare to baseline from previous day

3. **Related services**
   - Check upstream and downstream dependencies
   - Look for cascading failures

## Output Format

Provide a summary of findings with:
- Timeline of events
- Key error messages
- Metrics that correlate with the issue
`,
});

const githubSearch = skill({
  name: 'github-search',
  description: 'Search GitHub for recent changes',
  instructions: `
Search GitHub for recent deployments and code changes.

## What to Look For

1. **Recent deployments**
   - Check deployment history for the affected service
   - Note deploy times relative to incident start
   - Look for rollbacks or failed deploys

2. **Recent commits**
   - Search for commits in the past 24 hours
   - Focus on changes to configuration, dependencies, or critical paths
   - Note any risky changes (database migrations, API changes)

3. **Pull requests**
   - Check recently merged PRs
   - Look for PRs that might relate to the symptoms

## Output Format

Provide a list of potentially relevant changes with:
- Commit/PR reference
- Deploy time
- Brief description of changes
- Risk assessment
`,
});

const correlate = skill({
  name: 'correlate-findings',
  description: 'Cross-reference and analyze findings',
  instructions: `
Analyze the gathered evidence to identify probable root cause.

## Analysis Steps

1. **Build timeline**
   - Correlate error timestamps with deployment times
   - Identify the "first bad" event

2. **Assess confidence**
   - High confidence: Clear correlation between deploy and errors
   - Medium confidence: Timing suggests correlation but not conclusive
   - Low confidence: No clear correlation found

3. **Identify root cause**
   - If deployment-related: identify the specific change
   - If not deployment-related: suggest other possible causes

## Output

Provide:
- Most likely root cause
- Confidence level (high/medium/low)
- Recommended action
`,
});

const alertOncall = skill({
  name: 'alert-oncall',
  description: 'Alert on-call engineer',
  instructions: `
Alert the on-call engineer with the incident findings.

## Alert Contents

Include:
- Brief incident summary
- Probable root cause
- Recommended immediate action
- Link to relevant dashboards/logs

## Communication

- Post to #incidents Slack channel
- Tag the on-call engineer
- Create incident ticket if none exists
`,
});

const logFinding = skill({
  name: 'log-finding',
  description: 'Log findings for review',
  instructions: `
Log the investigation findings for later review.

## What to Record

- Investigation summary
- Findings from each source
- Hypothesis (if any)
- Recommended follow-up

This is for cases where immediate action is not required.
`,
});

// Compose the incident response workflow
export default pipe(
  // First, gather evidence from multiple sources in parallel
  parallel(
    hydrate(datadogSearch, {
      defaultTimeRange: '2h',
      defaultServices: ['api-gateway', 'user-service', 'payment-service'],
    }),
    hydrate(githubSearch, {
      repos: ['myorg/api-gateway', 'myorg/user-service', 'myorg/payment-service'],
    })
  ),

  // Then correlate the findings
  correlate,

  // Finally, take action based on confidence
  fork({
    when: 'confidence === "high" || severity === "critical"',
    then: alertOncall,
    else: logFinding,
  })
);
