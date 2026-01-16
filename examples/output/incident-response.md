---
name: incident-response
description: Comprehensive incident investigation workflow with automated evidence gathering and response routing
---

# Incident Response Investigation

This skill performs a comprehensive incident investigation by gathering evidence from multiple sources simultaneously, analyzing the findings to identify probable root cause, and routing the response based on confidence level and severity.

## Evidence Gathering Phase

You will simultaneously gather information from multiple sources to build a complete picture of the incident:

### Search Datadog for System Evidence

Search Datadog focusing on the past 2 hours across api-gateway, user-service, and payment-service for:

**Error logs** in the affected service:
- Filter by service name and error level
- Look for stack traces and error messages
- Note timestamps of first occurrence

**Metrics anomalies**:
- Check CPU, memory, and request latency
- Look for sudden spikes or drops
- Compare to baseline from previous day

**Related services**:
- Check upstream and downstream dependencies
- Look for cascading failures

Provide a summary of findings with timeline of events, key error messages, and metrics that correlate with the issue.

### Search GitHub for Recent Changes

Concurrently search the myorg/api-gateway, myorg/user-service, and myorg/payment-service repositories for:

**Recent deployments**:
- Check deployment history for the affected service
- Note deploy times relative to incident start
- Look for rollbacks or failed deploys

**Recent commits**:
- Search for commits in the past 24 hours
- Focus on changes to configuration, dependencies, or critical paths
- Note any risky changes (database migrations, API changes)

**Pull requests**:
- Check recently merged PRs
- Look for PRs that might relate to the symptoms

Provide a list of potentially relevant changes with commit/PR reference, deploy time, brief description of changes, and risk assessment.

## Analysis and Correlation

Once you have gathered evidence from both sources, analyze the findings to identify the probable root cause:

**Build timeline**:
- Correlate error timestamps with deployment times
- Identify the "first bad" event

**Assess confidence level**:
- **High confidence**: Clear correlation between deploy and errors
- **Medium confidence**: Timing suggests correlation but not conclusive
- **Low confidence**: No clear correlation found

**Identify root cause**:
- If deployment-related: identify the specific change
- If not deployment-related: suggest other possible causes

Provide the most likely root cause, confidence level (high/medium/low), and recommended action.

## Response Routing

Based on your analysis, route the response appropriately:

**If confidence is high OR severity is critical**, immediately alert the on-call engineer:
- Post to #incidents Slack channel with brief incident summary
- Tag the on-call engineer
- Include probable root cause and recommended immediate action
- Provide links to relevant dashboards/logs
- Create incident ticket if none exists

**Otherwise**, log the investigation findings for later review:
- Record investigation summary
- Document findings from each source (Datadog and GitHub)
- Note your hypothesis and confidence level
- Provide recommended follow-up actions for cases where immediate escalation is not required

This workflow ensures thorough investigation while appropriately escalating based on the severity and clarity of findings.