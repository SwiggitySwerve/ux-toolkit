# Info Card UI Patterns

Patterns for card-based information displays including compact list cards, standard detail cards, and expanded views. Applies to entity displays, stat blocks, profile cards, and any summarized data presentation.

## When to Use This Skill

- Entity/item cards (users, products, units)
- Stat blocks (RPG characters, game units)
- Profile/contact cards
- Product comparison cards
- Dashboard summary cards
- Search result cards
- Notification cards

---

## Core Concepts

### Card Variants

| Variant | Height | Use Case | Information Density |
|---------|--------|----------|---------------------|
| **Compact** | 48-64px | List views, search results | Name + 2-3 key stats |
| **Standard** | 120-200px | Grid layouts, medium detail | Name + image + stats + actions |
| **Expanded** | 300px+ | Detail views, full info | Everything including secondary data |

### Information Hierarchy

1. **Primary**: Name/title, main identifier
2. **Secondary**: Key stats, status badges
3. **Tertiary**: Metadata, timestamps, secondary attributes
4. **Actions**: Buttons, menus, links

---

## Audit Checklist

### Compact Card (List Item)
- [ ] [CRITICAL] Primary identifier readable at glance
- [ ] [CRITICAL] Consistent height across all cards
- [ ] [MAJOR] Key stats visible without hover
- [ ] [MAJOR] Status indicator (badge/dot) if applicable
- [ ] [MAJOR] Click target is entire card
- [ ] [MINOR] Hover state indicates interactivity
- [ ] [MINOR] Truncation for long text with ellipsis

### Standard Card
- [ ] [CRITICAL] Clear visual hierarchy (title > stats > metadata)
- [ ] [CRITICAL] Actions accessible without opening detail view
- [ ] [MAJOR] Image/avatar if applicable
- [ ] [MAJOR] Consistent card dimensions in grid
- [ ] [MAJOR] Status clearly indicated
- [ ] [MINOR] Secondary actions in overflow menu
- [ ] [MINOR] Loading skeleton matches card shape

### Expanded Card / Detail View
- [ ] [CRITICAL] All relevant information accessible
- [ ] [MAJOR] Grouped by category/section
- [ ] [MAJOR] Collapsible sections for dense data
- [ ] [MAJOR] Print-friendly layout option
- [ ] [MINOR] Copy-to-clipboard for key values
- [ ] [MINOR] Share/export functionality

### Information Display
- [ ] [CRITICAL] Labels clearly associated with values
- [ ] [CRITICAL] Units displayed for numeric values
- [ ] [MAJOR] Consistent alignment (labels left, values right)
- [ ] [MAJOR] Color coding for status/quality values
- [ ] [MINOR] Tooltips for abbreviated labels
- [ ] [MINOR] Relative values (e.g., "+10%") where meaningful

### Status Badges
- [ ] [CRITICAL] Status immediately recognizable
- [ ] [CRITICAL] Color + text (not color alone)
- [ ] [MAJOR] Consistent badge styling across app
- [ ] [MAJOR] Badge size appropriate to context
- [ ] [MINOR] Badge tooltip with full status description

### Responsive Behavior
- [ ] [CRITICAL] Cards readable on mobile
- [ ] [MAJOR] Grid adapts column count to viewport
- [ ] [MAJOR] Compact variant for constrained space
- [ ] [MINOR] Touch-friendly action targets (44px+)

### Accessibility
- [ ] [CRITICAL] Card role and label for screen readers
- [ ] [CRITICAL] Interactive cards are focusable
- [ ] [MAJOR] Actions have accessible names
- [ ] [MAJOR] Color contrast meets WCAG AA
- [ ] [MINOR] Keyboard navigation between cards

---

## Implementation Patterns

### Compact Card Component

```tsx
interface CompactCardProps {
  id: string;
  name: string;
  subtitle?: string;
  stats: Array<{ label: string; value: string | number }>;
  status?: { label: string; variant: BadgeVariant };
  onClick?: () => void;
  className?: string;
}

function CompactCard({ 
  id, 
  name, 
  subtitle, 
  stats, 
  status, 
  onClick,
  className = '' 
}: CompactCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between gap-4 p-3
        bg-surface-base rounded-lg border border-border-theme-subtle
        hover:bg-surface-raised hover:border-border-theme
        transition-colors cursor-pointer
        ${className}
      `}
      role="article"
      aria-labelledby={`card-${id}-title`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* Left: Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 
            id={`card-${id}-title`}
            className="font-semibold text-text-theme-primary truncate"
          >
            {name}
          </h3>
          {status && (
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-text-theme-muted truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Right: Key Stats */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {stats.slice(0, 3).map((stat, idx) => (
          <div key={idx} className="text-right">
            <div className="text-xs text-text-theme-muted uppercase tracking-wide">
              {stat.label}
            </div>
            <div className="font-mono font-medium text-text-theme-primary">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Standard Card Component

```tsx
interface StandardCardProps {
  id: string;
  name: string;
  image?: string;
  description?: string;
  stats: Array<{ label: string; value: string | number; highlight?: boolean }>;
  badges?: Array<{ label: string; variant: BadgeVariant }>;
  actions?: Array<{ label: string; icon?: React.ReactNode; onClick: () => void }>;
  onClick?: () => void;
}

function StandardCard({
  id,
  name,
  image,
  description,
  stats,
  badges = [],
  actions = [],
  onClick,
}: StandardCardProps) {
  return (
    <div
      className="bg-surface-base rounded-xl border border-border-theme-subtle overflow-hidden hover:shadow-lg transition-shadow"
      role="article"
      aria-labelledby={`card-${id}-title`}
    >
      {/* Header with Image */}
      {image && (
        <div className="aspect-video bg-surface-deep">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            id={`card-${id}-title`}
            className="font-semibold text-lg text-text-theme-primary"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            {name}
          </h3>
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {badges.map((badge, idx) => (
                <Badge key={idx} variant={badge.variant} size="sm">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-text-theme-secondary mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {stats.slice(0, 6).map((stat, idx) => (
            <div key={idx}>
              <div className="text-xs text-text-theme-muted uppercase">
                {stat.label}
              </div>
              <div className={`font-mono font-medium ${
                stat.highlight ? 'text-accent' : 'text-text-theme-primary'
              }`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        
        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 pt-3 border-t border-border-theme-subtle">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={idx === 0 ? 'primary' : 'ghost'}
                size="sm"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Stat Block Component

```tsx
interface StatBlockProps {
  stats: Array<{
    label: string;
    value: string | number;
    max?: number;
    color?: 'default' | 'success' | 'warning' | 'danger';
  }>;
  columns?: 2 | 3 | 4;
  variant?: 'inline' | 'stacked';
}

function StatBlock({ stats, columns = 3, variant = 'stacked' }: StatBlockProps) {
  const colorClasses = {
    default: 'text-text-theme-primary',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
  };
  
  return (
    <dl className={`grid grid-cols-${columns} gap-4`}>
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className={variant === 'inline' ? 'flex justify-between' : ''}
        >
          <dt className="text-xs text-text-theme-muted uppercase tracking-wide">
            {stat.label}
          </dt>
          <dd className={`font-mono font-medium ${colorClasses[stat.color || 'default']}`}>
            {stat.value}
            {stat.max !== undefined && (
              <span className="text-text-theme-muted">/{stat.max}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

### Badge Component

```tsx
type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'slate' | 'muted';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

function Badge({ children, variant = 'muted', size = 'md', icon }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    muted: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  
  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${variantClasses[variant]}
      ${sizeClasses[size]}
    `}>
      {icon}
      {children}
    </span>
  );
}
```

### Card Grid Layout

```tsx
interface CardGridProps {
  children: React.ReactNode;
  variant?: 'compact' | 'standard' | 'expanded';
}

function CardGrid({ children, variant = 'standard' }: CardGridProps) {
  const gridClasses = {
    compact: 'flex flex-col gap-2',
    standard: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    expanded: 'flex flex-col gap-6',
  };
  
  return (
    <div className={gridClasses[variant]}>
      {children}
    </div>
  );
}
```

---

## Visual Patterns

### Status Badge Colors

```typescript
const STATUS_BADGES = {
  active: { label: 'Active', variant: 'emerald' as const },
  inactive: { label: 'Inactive', variant: 'slate' as const },
  pending: { label: 'Pending', variant: 'amber' as const },
  error: { label: 'Error', variant: 'rose' as const },
  premium: { label: 'Premium', variant: 'violet' as const },
  new: { label: 'New', variant: 'cyan' as const },
};
```

### Value Coloring

```typescript
function getValueColor(value: number, thresholds: { good: number; warning: number }) {
  if (value >= thresholds.good) return 'text-emerald-400';
  if (value >= thresholds.warning) return 'text-amber-400';
  return 'text-red-400';
}

// Example usage for health percentage
const healthColor = getValueColor(healthPercent, { good: 75, warning: 25 });
```

---

## Anti-Patterns

### DON'T: Inconsistent Card Heights
```tsx
// BAD - Cards of varying height in a row
<div className="flex gap-4">
  <Card>Short content</Card>
  <Card>Very long content that spans multiple lines...</Card>
</div>

// GOOD - Fixed or min-height for consistency
<div className="grid grid-cols-3 gap-4">
  <Card className="min-h-[200px]">Short content</Card>
  <Card className="min-h-[200px]">Long content...</Card>
</div>
```

### DON'T: Color-Only Status
```tsx
// BAD - Status indicated only by color
<div className="w-3 h-3 rounded-full bg-green-500" />

// GOOD - Color + text
<Badge variant="emerald">Active</Badge>
```

### DON'T: Hidden Actions
```tsx
// BAD - Actions only appear on hover (inaccessible on touch)
<Card onMouseEnter={() => setShowActions(true)}>
  {showActions && <ActionButtons />}
</Card>

// GOOD - Actions always visible or in consistent location
<Card>
  <ActionButtons />
</Card>
```

### DON'T: Unlabeled Stats
```tsx
// BAD - Numbers without context
<div className="font-bold">42</div>

// GOOD - Label + value + unit
<div>
  <span className="text-xs text-gray-500">Speed</span>
  <span className="font-bold">42 mph</span>
</div>
```

---

## Accessibility

### Card Semantics

```tsx
// Article for standalone content
<article aria-labelledby={titleId}>
  <h3 id={titleId}>{title}</h3>
  ...
</article>

// List item when in a list
<li role="article" aria-labelledby={titleId}>
  ...
</li>
```

### Keyboard Navigation

```tsx
// Make cards focusable and activatable
<div
  role="article"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  aria-label={`${name}, ${status}. Press Enter for details.`}
>
```

---

## Testing Checklist

- [ ] Compact cards maintain consistent height
- [ ] Standard cards align in grid properly
- [ ] Long text truncates with ellipsis
- [ ] Badges display correct color for status
- [ ] Actions trigger correct callbacks
- [ ] Cards are keyboard navigable
- [ ] Screen reader announces card content
- [ ] Loading skeletons match card dimensions
- [ ] Responsive layout works at all breakpoints

---

## Related Skills

- `list-page-patterns` - For card list layouts
- `data-density-patterns` - For dense stat displays
- `status-visualization-patterns` - For health/progress indicators
