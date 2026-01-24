---
description: Quick accessibility check on a component or page
agent: accessibility-auditor
subtask: true
---
Perform an accessibility audit on $ARGUMENTS.

Load the wcag-accessibility skill and:
1. Get accessibility tree via Playwright MCP
2. Check WCAG 2.2 Level AA compliance
3. Test keyboard navigation flow
4. Verify ARIA usage and semantic HTML
5. Check color contrast ratios
6. Report issues with WCAG criterion mapping and specific remediation steps
