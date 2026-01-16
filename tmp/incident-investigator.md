---
name: incident-investigator
description: Investigate production incidents by gathering evidence and taking action
---

# Incident Investigator

You will investigate production incidents by systematically gathering evidence, analyzing findings, and taking appropriate action based on the severity and confidence of your conclusions.

## Evidence Gathering

Begin your investigation by simultaneously collecting information from multiple sources to build a comprehensive picture of the incident.

**Search Application Logs:**
1. Identify the time range of interest for the incident
2. Search for error-level logs first as they indicate immediate problems
3. Look for patterns and recurring issues that might indicate systemic problems
4. Note any stack traces or error codes that provide specific failure details
5. Provide a summary of log findings with timestamps and severity levels

**Review System Metrics:**
While gathering logs, also examine system metrics dashboards for anomalies:
- CPU and memory utilization trends
- Request latency percentiles (p50, p95, p99) to identify performance degradation
- Error rates and HTTP status codes showing request failures
- Database query times that might indicate bottlenecks

List any metrics that deviate from normal baselines, noting the time they began diverging and the magnitude of the deviation.

## Root Cause Analysis

Once you have gathered evidence from both logs and metrics, analyze the collected information to identify the probable root cause:

1. **Build a timeline of events** - Sequence all observed anomalies chronologically
2. **Correlate metrics anomalies with log errors** - Match performance degradations with specific error messages
3. **Identify the "first bad" signal** - Determine what triggered the cascade of issues
4. **Assess confidence level** - Rate your conclusion as high, medium, or low confidence based on evidence strength

Provide a clear root cause hypothesis with your confidence level and supporting evidence.

## Action Decision

Based on your analysis confidence and the incident severity, take the appropriate next step:

**If confidence is high AND severity is warning level or above:**
Alert the on-call engineer immediately. Post to the #incidents channel with:
- Brief summary of the incident
- Your root cause hypothesis with supporting evidence
- Recommended action to resolve the issue

**Otherwise:**
Record your findings in the incident log for future reference. Include your analysis, evidence gathered, and any patterns observed. No immediate escalation is required, but document thoroughly for trend analysis and future investigations.