---
name: wcag-accessibility
description: WCAG 2.2 accessibility compliance checklist with testing methods and ARIA patterns
license: MIT
---

# WCAG 2.2 Accessibility Compliance

## Quick Automated Checks

These can be verified programmatically:

- [ ] Color contrast ≥4.5:1 for normal text
- [ ] Color contrast ≥3:1 for large text and UI components
- [ ] All images have `alt` attributes
- [ ] Form inputs have associated labels
- [ ] Focus indicator visible on all interactive elements
- [ ] Page has proper heading hierarchy (h1 → h6, no skips)
- [ ] Landmark regions present (main, nav, banner, contentinfo)
- [ ] Language declared on `<html>` element
- [ ] Page has a descriptive `<title>`

## WCAG 2.2 New Success Criteria

### Level A

**2.4.11 Focus Not Obscured (Minimum)**
- Focus indicator must not be entirely hidden by other content
- At least part of the focused element must be visible

### Level AA

**2.4.12 Focus Not Obscured (Enhanced)**
- Focus indicator must not be hidden at all
- Entire focused element must be visible

**2.5.7 Dragging Movements**
- Any drag operation must have a single-pointer alternative
- Example: Drag-to-reorder must also support move buttons

**2.5.8 Target Size (Minimum)**
- Interactive targets must be at least 24×24 CSS pixels
- Exceptions: inline links, user-agent controlled, essential size

**3.3.7 Redundant Entry**
- Don't ask users to re-enter previously provided information
- Auto-populate or allow selection from previous entries

**3.3.8 Accessible Authentication (Minimum)**
- No cognitive function tests (puzzles, memory tests)
- If CAPTCHA required, provide accessible alternative
- Allow password managers and copy/paste

### Level AAA

**2.4.13 Focus Appearance**
- Focus indicator must have 3:1 contrast ratio
- Focus area must be at least 2px thick or equivalent

**3.3.9 Accessible Authentication (Enhanced)**
- No object recognition tests
- No personal content identification

## ARIA Patterns

### Alert Messages
```html
<div role="alert" aria-live="assertive">
  Error: Invalid email address
</div>
```

### Form Validation
```html
<label for="email">Email</label>
<input 
  id="email" 
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Please enter a valid email address
</span>
```

### Modal Dialogs
```html
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
</div>
```

Requirements:
- Trap focus within dialog
- Return focus to trigger on close
- Close on Escape key

### Expandable Sections
```html
<button 
  aria-expanded="false" 
  aria-controls="section1"
>
  Show Details
</button>
<div id="section1" hidden>
  Expandable content here
</div>
```

### Tab Panels
```html
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    General
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2">
    Privacy
  </button>
</div>
<div role="tabpanel" id="panel1">...</div>
<div role="tabpanel" id="panel2" hidden>...</div>
```

## Keyboard Navigation Requirements

| Element | Keys | Expected Behavior |
|---------|------|-------------------|
| Button | Enter, Space | Activate |
| Link | Enter | Navigate |
| Checkbox | Space | Toggle |
| Radio group | Arrow keys | Move selection |
| Tab list | Arrow keys | Switch tabs |
| Menu | Arrow keys, Enter, Escape | Navigate, select, close |
| Modal | Tab (trapped), Escape | Navigate within, close |
| Combobox | Arrow keys, Enter, Escape | Navigate, select, close |

## Testing Checklist

### Keyboard Testing
1. Tab through entire page - is order logical?
2. Can you reach all interactive elements?
3. Is focus indicator always visible?
4. Are there any keyboard traps?
5. Can you operate all controls without mouse?

### Screen Reader Testing
1. Is all content announced correctly?
2. Are images described appropriately?
3. Are form fields properly labeled?
4. Are dynamic updates announced?
5. Is the heading structure logical?

### Visual Testing
1. Is content readable at 200% zoom?
2. Does the layout work without color?
3. Is there sufficient contrast?
4. Are focus indicators visible?

## Common Issues and Fixes

| Issue | WCAG | Fix |
|-------|------|-----|
| Missing alt text | 1.1.1 | Add descriptive `alt` attribute |
| Low contrast | 1.4.3 | Increase color contrast ratio |
| Missing labels | 1.3.1 | Associate labels with inputs |
| No focus visible | 2.4.7 | Add visible focus styles |
| Keyboard trap | 2.1.2 | Ensure focus can leave component |
| Auto-playing media | 1.4.2 | Add pause/stop controls |
| Missing skip link | 2.4.1 | Add "skip to main content" link |
| No error identification | 3.3.1 | Clearly identify and describe errors |
