---
name: visual-design-system
description: Visual design principles including layout, typography, color theory, and spacing systems
license: MIT
---

# Visual Design System Principles

## Visual Hierarchy

Priority order: **Size > Color > Contrast > Position > Whitespace**

### Typography Scale

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Display | 48-72px | Bold | Hero headlines |
| H1 | 32-48px | Bold | Page titles |
| H2 | 24-32px | Semibold | Section headers |
| H3 | 20-24px | Semibold | Subsections |
| H4 | 18-20px | Medium | Card titles |
| Body | 16-18px | Regular | Content |
| Small | 14px | Regular | Captions, metadata |
| Tiny | 12px | Regular | Labels, hints |

### Typography Best Practices
- Line height: 1.4-1.6 for body text
- Line length: 50-75 characters optimal
- Font families: Maximum 2-3 per design
- Heading contrast: Darker than body text

## 8pt Grid System

Base unit: 8px (4px for fine adjustments)

| Token | Value | Use |
|-------|-------|-----|
| space-0 | 0 | Reset |
| space-1 | 4px | Tight spacing, icons |
| space-2 | 8px | Inline elements, small gaps |
| space-3 | 16px | Component padding |
| space-4 | 24px | Card padding |
| space-5 | 32px | Section spacing |
| space-6 | 48px | Large sections |
| space-7 | 64px | Page sections |
| space-8 | 96px | Hero spacing |

### Grid Alignment Checklist
- [ ] All spacing uses 8px increments (4px for fine tuning)
- [ ] Component padding is consistent
- [ ] Margins between sections are uniform
- [ ] Icons align to 4px grid

## Color System

### 60-30-10 Rule
- **60%** Neutral/background colors
- **30%** Secondary/surface colors
- **10%** Accent colors (CTAs, highlights)

### Semantic Color Tokens

| Token | Purpose | Example Use |
|-------|---------|-------------|
| primary | Brand, main actions | Submit buttons, links |
| secondary | Alternative actions | Cancel, secondary buttons |
| success | Positive feedback | Success messages, completed |
| warning | Caution states | Unsaved changes, warnings |
| error | Problems | Validation errors, failures |
| info | Neutral information | Tips, hints, help text |

### Color Contrast Requirements
| Use Case | Minimum Ratio | WCAG Level |
|----------|---------------|------------|
| Body text | 4.5:1 | AA |
| Large text (18px+) | 3:1 | AA |
| UI components | 3:1 | AA |
| Enhanced | 7:1 | AAA |

### Dark Mode Considerations
- Invert semantic meanings carefully
- Reduce pure white (#fff) to off-white
- Adjust shadows to glows
- Test contrast in both modes

## Layout Patterns

### Common Layouts

**F-Pattern**
- Best for: Text-heavy content
- Eye movement: Left to right, then down left side
- Place important content along the F

**Z-Pattern**
- Best for: Landing pages, minimal content
- Eye movement: Top left → top right → bottom left → bottom right
- Place CTA at end of Z

**Card Grid**
- Best for: Content collections, dashboards
- Use consistent card sizes
- Maintain gutters between cards

**Split Screen**
- Best for: Comparisons, form + preview
- Balance visual weight
- Consider responsive behavior

### Container Widths
| Size | Max Width | Use |
|------|-----------|-----|
| xs | 320px | Mobile narrow |
| sm | 540px | Mobile |
| md | 720px | Tablet |
| lg | 960px | Desktop |
| xl | 1140px | Large desktop |
| 2xl | 1320px | Extra large |
| full | 100% | Full bleed |

## Responsive Design

### Breakpoints
| Name | Width | Typical Device |
|------|-------|----------------|
| xs | <576px | Phone portrait |
| sm | ≥576px | Phone landscape |
| md | ≥768px | Tablet |
| lg | ≥992px | Desktop |
| xl | ≥1200px | Large desktop |
| 2xl | ≥1400px | Extra large |

### Mobile-First CSS
```css
.element {
  padding: 16px;
}

@media (min-width: 768px) {
  .element {
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .element {
    padding: 32px;
  }
}
```

## Gestalt Principles

### Proximity
Elements close together are perceived as related.
- Group related controls
- Add space between unrelated items
- Use whitespace to create sections

### Similarity
Similar elements are perceived as related.
- Use consistent styling for similar functions
- Differentiate distinct element types
- Color, shape, size signal relationships

### Continuity
Elements arranged in a line are perceived as related.
- Align elements along invisible lines
- Use consistent alignment throughout
- Guide the eye with visual flow

### Closure
The mind fills in gaps to complete shapes.
- Incomplete elements can suggest meaning
- Icons don't need full outlines
- Whitespace can define boundaries

## Design Review Checklist

### Visual Hierarchy
- [ ] Clear primary focal point
- [ ] Logical reading order
- [ ] Consistent heading levels
- [ ] Appropriate text sizes

### Spacing
- [ ] Consistent padding within components
- [ ] Consistent margins between sections
- [ ] Adequate whitespace for breathing room
- [ ] Touch targets ≥44px on mobile

### Color
- [ ] Follows 60-30-10 rule
- [ ] Semantic colors used appropriately
- [ ] Sufficient contrast ratios
- [ ] Works in dark mode (if applicable)

### Typography
- [ ] Readable font sizes
- [ ] Appropriate line height
- [ ] Good line length (50-75 chars)
- [ ] Limited font families (2-3 max)

### Alignment
- [ ] Elements aligned to grid
- [ ] Consistent left/center/right alignment
- [ ] Visual balance across page
- [ ] No orphaned elements
