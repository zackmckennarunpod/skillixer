---
name: cdc-observability
description: Diagnose CDC pipeline issues by analyzing infrastructure and logs, then provide targeted fixes or escalate critical problems
---

# CDC Pipeline Observability and Diagnostics

This skill diagnoses issues in Change Data Capture (CDC) pipelines by systematically analyzing infrastructure configuration and runtime logs. It identifies problems across the data flow from Kinesis streams through Firehose to Lambda processors, then provides actionable fixes or escalates critical issues.

## Infrastructure Analysis

You will first analyze the SST configuration at `../cdc/sst.config.ts` and infrastructure files in `../cdc/infra/` to understand the system architecture.

Focus specifically on:
- **Kinesis streams** - sources and destinations for data flow
- **Firehose delivery streams** - how data moves to storage
- **Lambda processors** - transformation and processing functions  
- **S3 destinations** - final data storage locations

### What to Look For

1. **Data flow mapping**
   - Trace how data moves through each component
   - Identify stream names, handlers, and connections
   - Note batch sizes, windows, and processing patterns

2. **Key resources and configuration**
   - Lambda function names and their specific handlers
   - IAM permissions and access patterns
   - Environment variables that control behavior
   - Resource linking and dependencies

3. **Resilience patterns**
   - Configured batch sizes and time windows
   - Retry policies and backoff strategies
   - Error handling and dead letter queues

Provide a clear text-based diagram of the data flow, key Lambda functions and their roles, and potential failure points you identify.

## Log Investigation

Simultaneously, search Datadog logs for the services `cdc-transformer`, `cdc-firehose`, and `cdc-processor` over the past 2 hours in the dev environment.

### Search Strategy

1. **Error logs first** - Start with the most critical issues
   ```
   service:cdc-transformer status:error
   service:cdc-firehose status:error  
   service:cdc-processor status:error
   ```
   Look for stack traces and note exact timestamps.

2. **Warning patterns** - Identify degradation signals
   ```
   service:cdc-transformer "timeout" OR "retry"
   service:cdc-firehose "timeout" OR "retry"
   service:cdc-processor "timeout" OR "retry"
   ```
   Focus on retries, backoffs, timeout warnings, and resource exhaustion.

3. **Error correlation** - Build the complete picture
   ```
   @error.kind:* service:cdc-transformer
   @error.kind:* service:cdc-firehose
   @error.kind:* service:cdc-processor
   ```
   Match errors across services and build a timeline.

Document a timeline of errors, error patterns and frequency, and which components are affected.

## Root Cause Analysis

Correlate the infrastructure understanding with the log findings to identify the true source of issues.

### Analysis Process

1. **Component mapping** - Connect logs to architecture
   - Which specific Lambda functions are failing?
   - At what stage in the pipeline do errors occur?
   - Are failures isolated or cascading?

2. **Root cause identification**
   - Configuration mismatches or invalid settings?
   - Resource limits being exceeded (memory, timeout, concurrency)?
   - External dependency failures (databases, APIs, downstream services)?
   - Data format or schema issues?

3. **Impact assessment**
   - Risk of data loss or corruption
   - Effects on downstream consumers
   - Available recovery options and rollback procedures

Provide a clear root cause assessment, impact analysis, and your recommended priority level.

## Resolution Path

Based on the severity and data loss risk of your findings, you'll either provide immediate fixes or escalate for urgent attention.

### For Critical Issues or Data Loss Risk

If the issue is critical or poses data loss risk, create a comprehensive incident report containing:
- **Issue summary** - Clear description of what's broken
- **Impact assessment** - Who and what is affected
- **Immediate actions taken** - Any emergency measures applied
- **Recommended next steps** - Priority actions for resolution
- **Reference links** - Specific Datadog log queries and relevant dashboards

Then provide detailed fix recommendations.

### Fix Recommendations

For all issues, suggest specific, actionable fixes organized by category:

1. **Configuration changes**
   - Specific SST config file updates needed
   - Environment variable adjustments
   - Batch size or window optimizations
   - Retry policy tuning

2. **Code improvements**
   - Enhanced error handling patterns
   - Improved retry logic with exponential backoff
   - Additional logging for better observability
   - Input validation strengthening

3. **Infrastructure adjustments**  
   - Lambda scaling configuration changes
   - IAM permission fixes or additions
   - Resource limit increases (memory, timeout)
   - New monitoring or alerting setup

For each recommended fix, specify:
- **Exact file to modify** with path
- **Specific change needed** with code examples where helpful
- **Expected outcome** and how to verify the fix worked

This systematic approach ensures you can quickly identify CDC pipeline issues and provide the right level of response, from immediate fixes to proper incident escalation.