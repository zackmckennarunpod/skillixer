---
name: code-quality
description: Comprehensive code quality analysis with security scanning and documentation generation
---

# Code Quality Analysis

Perform a comprehensive analysis of code quality, security, and documentation. This skill combines code review, security scanning, and automated documentation generation into a unified quality assessment workflow.

## Analysis Phase

Begin by conducting parallel analysis across two critical dimensions:

**Code Quality Review**: Examine the provided code for quality issues across multiple categories:

1. **Logic errors** - Off-by-one errors, missing null checks, unhandled edge cases
2. **Code smells** - Overly long methods, excessive nesting depth, magic numbers
3. **Naming conventions** - Clear, descriptive variable and function names that convey intent
4. **Structural issues** - Single responsibility violations, improper abstractions, tight coupling

For each quality issue identified, document:
- Location (file:line number)
- Severity level (critical/warning/info)
- Clear description of the problem
- Specific suggested fix or improvement

**Security Vulnerability Scanning**: Simultaneously scan for security vulnerabilities following OWASP Top 10 guidelines:

1. **Injection attacks** - SQL injection, command injection, LDAP injection vulnerabilities
2. **Broken authentication** - Weak password policies, session management issues
3. **Sensitive data exposure** - Hardcoded secrets, personally identifiable information (PII) leaks
4. **XML External Entity (XXE)** attacks - Unsafe XML parsing configurations
5. **Access control failures** - Missing authorization checks, privilege escalation risks

For each security vulnerability, provide:
- Applicable CWE ID for standardized classification
- Severity rating (critical/high/medium/low)
- Precise location and technical description
- Step-by-step remediation instructions

## Documentation Generation

After completing the analysis, generate comprehensive documentation for the reviewed code:

**Documentation Scope**:
- Complete function signatures with parameter descriptions
- Return types and possible return values
- Practical usage examples demonstrating proper implementation
- Edge cases and potential gotchas identified during review

**Output Format**: Create markdown documentation that includes:
- Structured API reference section
- Executable code examples
- Integration notes based on review findings
- Cross-references to any quality or security issues discovered

## Critical Findings Assessment

Evaluate whether any critical findings were discovered during the analysis. Critical findings include:
- Security vulnerabilities rated as critical or high severity
- Logic errors that could cause data loss or system failure
- Code quality issues that pose significant maintenance risks

**If critical findings are present**:

First, create a GitHub issue to track resolution:
- Comprehensive summary of all critical issues identified
- Detailed impact assessment explaining potential consequences
- Clear remediation priority ranking
- Assignment to appropriate team or individual responsible for fixes

Then, generate a comprehensive findings report with these sections:
1. **Executive Summary** - High-level overview for stakeholders
2. **Critical Issues** - Detailed breakdown of urgent problems requiring immediate attention
3. **Code Quality Score** - Quantitative assessment of overall code health
4. **Security Posture** - Summary of security vulnerabilities and risk level
5. **Recommendations** - Prioritized action items for improvement

**If no critical findings are present**:

Generate the same comprehensive findings report structure, emphasizing the positive security posture and code quality while highlighting any minor improvements that could be made.

The final deliverable provides a complete picture of code quality, security status, and actionable next steps for maintaining and improving the codebase.