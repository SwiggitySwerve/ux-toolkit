---
name: interaction-patterns
description: Micro-interaction patterns, loading states, feedback mechanisms, and animation guidelines
license: MIT
---

# Interaction Design Patterns

## Micro-interaction Anatomy

Every micro-interaction has four parts:

1. **Trigger** - What initiates it (user action or system event)
2. **Rules** - What happens in response
3. **Feedback** - Visual/audio response to the user
4. **Loops/Modes** - What happens on repeat or over time

## Feedback Timing

| Response Time | User Perception | Guidance |
|---------------|-----------------|----------|
| <100ms | Instant | No indicator needed |
| 100-300ms | Slight delay | Optional subtle feedback |
| 300-1000ms | Noticeable | Show loading indicator |
| 1-5s | Waiting | Show progress or skeleton |
| >5s | Long wait | Show progress + estimated time |

## Loading State Patterns

### Skeleton Screens (Preferred)
Best for: Content with predictable layout

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: #e0e0e0;
  }
}
```

### Spinner
Best for: Short operations, unknown duration

- Use for actions <3 seconds
- Center within the loading area
- Include text for longer waits ("Loading...")

### Progress Bar
Best for: Determinate operations

- Show percentage or steps completed
- Move smoothly, never backwards
- Include text description of current step

### Optimistic UI
Best for: High-confidence operations

- Update UI immediately before server confirms
- Show subtle pending indicator
- Revert gracefully on failure

## Button States

| State | Visual Treatment | Timing |
|-------|------------------|--------|
| Default | Base style | - |
| Hover | Subtle highlight (5-10% lighter/darker) | Immediate |
| Focus | Visible ring/outline (2px+) | Immediate |
| Active | Pressed appearance (slight scale/shadow) | Immediate |
| Loading | Spinner replaces or joins text | During operation |
| Disabled | Reduced opacity (50-60%), no pointer | - |
| Success | Brief green flash (optional) | 1-2s then reset |

### Button Loading Pattern
```tsx
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="mr-2" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</button>
```

## Form Interactions

### Validation Timing
| Approach | When | Best For |
|----------|------|----------|
| On change (debounced) | As user types | Real-time feedback, username availability |
| On blur | When leaving field | Most form fields |
| On submit | Form submission | Final validation |

### Input States
- **Default**: Ready for input
- **Focused**: Active, ready for input
- **Filled**: Has value, not focused
- **Error**: Invalid value, show message
- **Success**: Valid value (optional)
- **Disabled**: Not editable

### Error Message Pattern
```html
<div class="form-field">
  <label for="email">Email</label>
  <input 
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <span id="email-error" class="error" role="alert">
    Please enter a valid email address
  </span>
</div>
```

## Animation Guidelines

### Principles
1. **Purposeful** - Guides attention, communicates meaning
2. **Subtle** - Enhances, doesn't distract
3. **Fast** - 150-300ms for micro-interactions
4. **Smooth** - 60fps, no jank
5. **Respectful** - Honors `prefers-reduced-motion`

### Easing Functions
| Easing | Use Case |
|--------|----------|
| ease-out | Elements entering (fast start, slow end) |
| ease-in | Elements exiting (slow start, fast end) |
| ease-in-out | Elements moving within view |
| linear | Progress indicators, loading |

### Duration Guidelines
| Animation Type | Duration |
|----------------|----------|
| Micro-interaction | 100-200ms |
| State change | 150-300ms |
| Page transition | 300-500ms |
| Complex animation | 500-1000ms |

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Error Handling UX

### Principles
1. **Prevent first** - Validate before errors occur
2. **Be specific** - What exactly went wrong
3. **Be helpful** - How to fix it
4. **Be kind** - Don't blame the user
5. **Preserve work** - Never lose user input

### Error Message Components
1. **What happened** - Clear description of the problem
2. **Why it happened** - Context if helpful
3. **What to do** - Specific recovery action

### Error Display Patterns

**Inline (field-level)**
- Show next to the problematic field
- Use for form validation
- Red border + error message below

**Toast (transient)**
- Auto-dismiss after 5-10 seconds
- Use for non-critical errors
- Include dismiss button

**Banner (persistent)**
- Show at top of page/section
- Use for page-level issues
- Stays until resolved

**Modal (blocking)**
- Use sparingly for critical errors
- Require acknowledgment
- Provide clear action path

## Optimistic UI Pattern

### When to Use
- Toggle states (like, bookmark)
- Simple text edits
- Reordering items
- Adding to lists

### When to Avoid
- Financial transactions
- Irreversible actions
- Complex server validation
- Multi-step processes

### Implementation
```typescript
async function toggleLike(itemId: string) {
  // 1. Optimistically update UI
  setLiked(true);
  
  try {
    // 2. Send to server
    await api.like(itemId);
  } catch (error) {
    // 3. Revert on failure
    setLiked(false);
    showError('Failed to save');
  }
}
```

## Notification Patterns

### Types
| Type | Duration | Dismissible | Use |
|------|----------|-------------|-----|
| Success | 3-5s | Yes | Confirmation of action |
| Info | 5-10s | Yes | Neutral information |
| Warning | Persistent | Yes | Requires attention |
| Error | Persistent | Yes | Problem occurred |

### Placement
- **Top right** - Most common, notifications
- **Top center** - Important alerts
- **Bottom center** - Mobile, snackbars
- **Inline** - Context-specific feedback
