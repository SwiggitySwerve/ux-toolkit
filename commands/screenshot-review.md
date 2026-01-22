---
description: Take a screenshot and perform visual UX review
agent: ux-auditor
subtask: true
---
Navigate to $ARGUMENTS, capture visuals, and perform UX review.

Using Playwright MCP:
1. Navigate to the URL or render the component
2. Capture screenshot with playwright_screenshot
3. Get accessibility tree with playwright_snapshot
4. Analyze visual design (hierarchy, spacing, color)
5. Check accessibility indicators in the tree
6. Evaluate interaction affordances
7. Report findings with specific locations and recommendations
