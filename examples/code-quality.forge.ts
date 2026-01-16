/**
 * Example: Code Quality Workflow
 *
 * Combines code review, security scanning, and documentation
 * into a unified code quality skill.
 */
import { skill, pipe, parallel, fork } from '../src/index.js';

// Individual skills
const codeReview = skill({
  name: 'code-review',
  description: 'Review code for quality issues',
  instructions: `
Review the provided code for quality issues.

## What to Check

1. **Logic errors** - Off-by-one, null checks, edge cases
2. **Code smells** - Long methods, deep nesting, magic numbers
3. **Naming** - Clear, descriptive variable and function names
4. **Structure** - Single responsibility, proper abstractions

## Output

For each issue:
- Location (file:line)
- Severity (critical/warning/info)
- Description
- Suggested fix
`,
});

const securityScan = skill({
  name: 'security-scan',
  description: 'Scan for security vulnerabilities',
  instructions: `
Scan the code for security vulnerabilities.

## OWASP Top 10 Checks

1. **Injection** - SQL, command, LDAP injection
2. **Broken Auth** - Weak passwords, session issues
3. **Sensitive Data** - Hardcoded secrets, PII exposure
4. **XXE** - XML external entity attacks
5. **Access Control** - Missing authorization checks

## Output

For each vulnerability:
- CWE ID if applicable
- Severity (critical/high/medium/low)
- Location and description
- Remediation steps
`,
});

const generateDocs = skill({
  name: 'generate-docs',
  description: 'Generate documentation',
  instructions: `
Generate documentation for the reviewed code.

## What to Document

- Function signatures and parameters
- Return types and values
- Usage examples
- Edge cases and gotchas

## Output Format

Markdown documentation with:
- API reference
- Code examples
- Notes from review findings
`,
});

const createIssue = skill({
  name: 'create-issue',
  description: 'Create tracking issue for critical findings',
  instructions: `
Create a GitHub issue for critical findings.

Include:
- Summary of critical issues
- Impact assessment
- Remediation priority
- Assigned team/person
`,
});

const summarize = skill({
  name: 'summarize-findings',
  description: 'Summarize all findings',
  instructions: `
Create a summary report of all findings.

## Report Sections

1. Executive Summary
2. Critical Issues (if any)
3. Code Quality Score
4. Security Posture
5. Recommendations
`,
});

// Compose into a workflow
export default pipe(
  // First, run review and security scan in parallel
  parallel(codeReview, securityScan),

  // Then generate docs based on findings
  generateDocs,

  // Branch: create issue if critical, otherwise just summarize
  fork({
    when: 'hasCriticalFindings',
    then: pipe(createIssue, summarize),
    else: summarize,
  })
);
