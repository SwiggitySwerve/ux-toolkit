---
name: ux-heuristics
description: Nielsen's 10 usability heuristics with evaluation methodology and severity scoring
license: MIT
---

# Usability Heuristics Evaluation

## Nielsen's 10 Heuristics

### 1. Visibility of System Status
Keep users informed through timely feedback.

**Check for:**
- Loading states and progress indicators
- Save/submit confirmations
- Error notifications
- Connection status indicators

**Severity if missing:** High - users feel lost without feedback

### 2. Match Between System and Real World
Use familiar language and follow real-world conventions.

**Check for:**
- User-friendly terminology (not developer jargon)
- Intuitive iconography
- Logical information ordering
- Cultural appropriateness

**Severity if violated:** Medium-High

### 3. User Control and Freedom
Provide emergency exits and undo support.

**Check for:**
- Cancel buttons on forms/dialogs
- Back navigation
- Undo/redo functionality
- Clear exit paths from workflows

**Severity if missing:** High

### 4. Consistency and Standards
Follow platform conventions and internal patterns.

**Check for:**
- Consistent button styles and placement
- Uniform terminology across screens
- Standard interaction patterns (e.g., swipe to delete)
- Platform-specific conventions (iOS HIG, Material Design)

**Severity if violated:** Medium-High

### 5. Error Prevention
Prevent problems before they occur.

**Check for:**
- Confirmation dialogs for destructive actions
- Input validation before submission
- Constraints that prevent invalid states
- Clear affordances for interactive elements

**Severity if missing:** High for destructive actions

### 6. Recognition Rather Than Recall
Minimize memory load by making options visible.

**Check for:**
- Visible navigation and options
- Contextual help and hints
- Recent items and history
- Autocomplete suggestions

**Severity if violated:** Medium

### 7. Flexibility and Efficiency of Use
Provide accelerators for expert users.

**Check for:**
- Keyboard shortcuts
- Customization options
- Shortcuts for frequent actions
- Power user features

**Severity if missing:** Low-Medium

### 8. Aesthetic and Minimalist Design
Remove irrelevant or rarely needed information.

**Check for:**
- Information density (too much? too little?)
- Visual clutter
- Clear hierarchy
- Purposeful use of color and typography

**Severity if violated:** Medium

### 9. Help Users Recognize, Diagnose, and Recover from Errors
Provide clear error messages with solutions.

**Check for:**
- Human-readable error messages (not error codes)
- Specific problem identification
- Actionable recovery suggestions
- Non-blaming tone

**Severity if violated:** High

### 10. Help and Documentation
Provide searchable, task-focused help.

**Check for:**
- Help availability (tooltips, docs, FAQs)
- Searchable documentation
- Task-oriented guidance
- Contextual help

**Severity if missing:** Low-Medium

## Severity Rating Scale

| Rating | Label | Description | Action |
|--------|-------|-------------|--------|
| 0 | Not a problem | No usability issue | None |
| 1 | Cosmetic | Minor visual issue | Fix if time permits |
| 2 | Minor | Causes slight confusion | Low priority |
| 3 | Major | Significantly impacts task completion | High priority |
| 4 | Catastrophic | Prevents task completion | Must fix immediately |

## Evaluation Process

1. **Identify the scope** - Which screens/flows to evaluate
2. **Review independently** - Evaluate each heuristic separately
3. **Document issues** - Note location, heuristic violated, severity
4. **Calculate priority** - Frequency × Severity = Priority
5. **Recommend fixes** - Provide specific, actionable solutions

## Output Format

For each issue found:

```
**Issue:** [Brief description]
**Location:** [Screen/component/flow]
**Heuristic:** [Number and name]
**Severity:** [0-4]
**Impact:** [How it affects users]
**Recommendation:** [Specific fix]
```
