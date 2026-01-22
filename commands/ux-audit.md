---
description: Perform a comprehensive UX audit on a component or page
agent: ux-auditor
subtask: true
---
Perform a comprehensive UX audit on $ARGUMENTS.

Steps:
1. Load relevant skills (ux-heuristics, wcag-accessibility, visual-design-system)
2. Take a screenshot and get accessibility snapshot using Playwright MCP
3. Evaluate against Nielsen's 10 usability heuristics
4. Check accessibility compliance (WCAG 2.2 Level AA)
5. Review visual design consistency
6. Rate each issue by severity (0-4 scale)
7. Provide prioritized recommendations with specific fixes
