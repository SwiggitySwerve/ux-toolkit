# Split Panel UI Patterns

Patterns for multi-panel layouts with resizable dividers, synchronized views, and responsive behavior. Applies to IDEs, email clients, comparison views, master-detail layouts, and any application with side-by-side panels.

## When to Use This Skill

- IDE/code editors (file tree + editor + terminal)
- Email clients (folders + list + preview)
- Master-detail layouts
- Side-by-side comparison
- Property inspectors
- Debug layouts (code + console + variables)
- Dashboard panels

---

## Core Concepts

### Panel Types

| Type | Description | Example |
|------|-------------|---------|
| **Primary** | Main content area | Editor, email body |
| **Secondary** | Supporting content | Sidebar, preview |
| **Tertiary** | Optional/collapsible | Properties, console |

### Split Orientations

| Orientation | Use Case |
|-------------|----------|
| **Horizontal** | Left/right panels (most common) |
| **Vertical** | Top/bottom panels (IDE terminals) |
| **Grid** | 2x2 or more complex layouts |

### Resize Modes

| Mode | Behavior |
|------|----------|
| **Drag** | User drags divider |
| **Double-click** | Reset to default or toggle collapse |
| **Keyboard** | Arrow keys adjust size |
| **Preset** | Jump to predefined ratios (33/66, 50/50) |

---

## Audit Checklist

### Panel Dividers
- [ ] [CRITICAL] Divider visually distinct from panels
- [ ] [CRITICAL] Divider cursor indicates draggability
- [ ] [MAJOR] Hover state on divider
- [ ] [MAJOR] Drag feedback (line follows mouse)
- [ ] [MINOR] Double-click to reset/toggle
- [ ] [MINOR] Keyboard control for resize

### Resize Behavior
- [ ] [CRITICAL] Panels resize smoothly during drag
- [ ] [CRITICAL] Minimum sizes enforced (content not crushed)
- [ ] [MAJOR] Maximum sizes enforced (if applicable)
- [ ] [MAJOR] Content reflows appropriately
- [ ] [MINOR] Snap to preset ratios
- [ ] [MINOR] Size persistence across sessions

### Collapse/Expand
- [ ] [MAJOR] Panel can collapse to minimize
- [ ] [MAJOR] Clear toggle button for collapse
- [ ] [MAJOR] Smooth collapse animation
- [ ] [MINOR] Keyboard shortcut for toggle
- [ ] [MINOR] Collapsed state shows hint of content

### Content Scrolling
- [ ] [CRITICAL] Each panel scrolls independently
- [ ] [MAJOR] Scroll position preserved on resize
- [ ] [MINOR] Synchronized scrolling option (for diff views)
- [ ] [MINOR] Scroll indicators visible

### Responsive Behavior
- [ ] [CRITICAL] Layout adapts to narrow viewports
- [ ] [MAJOR] Panels stack vertically on mobile
- [ ] [MAJOR] One panel prioritized on small screens
- [ ] [MINOR] Touch-friendly resize handles
- [ ] [MINOR] Swipe to switch panels on mobile

### Accessibility
- [ ] [CRITICAL] Panels are keyboard navigable
- [ ] [CRITICAL] Divider is keyboard accessible
- [ ] [MAJOR] Focus management between panels
- [ ] [MAJOR] ARIA labels for panels and dividers
- [ ] [MINOR] Screen reader announces panel sizes

### Performance
- [ ] [MAJOR] Resize doesn't cause layout thrashing
- [ ] [MAJOR] Content doesn't flicker during resize
- [ ] [MINOR] Debounced resize callbacks
- [ ] [MINOR] CSS resize where possible

---

## Implementation Patterns

### Basic Split Panel Component

```tsx
interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number; // Percentage
  minLeftWidth?: number;
  maxLeftWidth?: number;
  onResize?: (leftWidth: number) => void;
  className?: string;
}

function SplitPanel({
  left,
  right,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  onResize,
  className = '',
}: SplitPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clamped = Math.max(minLeftWidth, Math.min(maxLeftWidth, percentage));
    
    setLeftWidth(clamped);
    onResize?.(clamped);
  }, [isDragging, minLeftWidth, maxLeftWidth, onResize]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add/remove global listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Double-click to reset
  const handleDoubleClick = useCallback(() => {
    setLeftWidth(defaultLeftWidth);
    onResize?.(defaultLeftWidth);
  }, [defaultLeftWidth, onResize]);
  
  return (
    <div 
      ref={containerRef}
      className={`flex h-full ${className}`}
    >
      {/* Left panel */}
      <div 
        className="overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>
      
      {/* Divider */}
      <div
        className={`
          w-1 flex-shrink-0 cursor-col-resize
          bg-border-theme-subtle hover:bg-accent
          transition-colors
          ${isDragging ? 'bg-accent' : ''}
        `}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            setLeftWidth(prev => Math.max(minLeftWidth, prev - 5));
          } else if (e.key === 'ArrowRight') {
            setLeftWidth(prev => Math.min(maxLeftWidth, prev + 5));
          }
        }}
      />
      
      {/* Right panel */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
}
```

### Collapsible Panel Component

```tsx
interface CollapsiblePanelProps {
  children: React.ReactNode;
  title: string;
  side: 'left' | 'right';
  defaultExpanded?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  onExpandedChange?: (expanded: boolean) => void;
}

function CollapsiblePanel({
  children,
  title,
  side,
  defaultExpanded = true,
  defaultWidth = 300,
  minWidth = 200,
  onExpandedChange,
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [width, setWidth] = useState(defaultWidth);
  
  const toggle = useCallback(() => {
    setIsExpanded(prev => {
      const newValue = !prev;
      onExpandedChange?.(newValue);
      return newValue;
    });
  }, [onExpandedChange]);
  
  return (
    <div
      className={`
        flex-shrink-0 border-${side === 'left' ? 'r' : 'l'} border-border-theme-subtle
        transition-all duration-300 ease-in-out overflow-hidden
      `}
      style={{ width: isExpanded ? width : 40 }}
    >
      {isExpanded ? (
        <div className="h-full flex flex-col" style={{ width }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-theme-subtle">
            <h3 className="font-medium text-sm text-text-theme-primary">{title}</h3>
            <button
              onClick={toggle}
              className="p-1 hover:bg-surface-raised rounded"
              aria-label={`Collapse ${title}`}
            >
              {side === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      ) : (
        <button
          onClick={toggle}
          className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-surface-raised"
          aria-label={`Expand ${title}`}
        >
          {side === 'left' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          <span className="writing-mode-vertical text-xs text-text-theme-secondary">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}
```

### Three-Panel Layout

```tsx
interface ThreePanelLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
}

function ThreePanelLayout({
  left,
  center,
  right,
  leftTitle = 'Navigator',
  rightTitle = 'Properties',
  defaultLeftWidth = 250,
  defaultRightWidth = 300,
}: ThreePanelLayoutProps) {
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(true);
  
  return (
    <div className="flex h-full">
      {/* Left panel */}
      <CollapsiblePanel
        title={leftTitle}
        side="left"
        defaultWidth={defaultLeftWidth}
        defaultExpanded={leftExpanded}
        onExpandedChange={setLeftExpanded}
      >
        {left}
      </CollapsiblePanel>
      
      {/* Center panel (main content) */}
      <div className="flex-1 overflow-hidden">
        {center}
      </div>
      
      {/* Right panel */}
      <CollapsiblePanel
        title={rightTitle}
        side="right"
        defaultWidth={defaultRightWidth}
        defaultExpanded={rightExpanded}
        onExpandedChange={setRightExpanded}
      >
        {right}
      </CollapsiblePanel>
    </div>
  );
}
```

### Synchronized Scroll Panels

```tsx
interface SyncScrollPanelsProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  syncEnabled?: boolean;
}

function SyncScrollPanels({ 
  leftContent, 
  rightContent,
  syncEnabled = true 
}: SyncScrollPanelsProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  
  const syncScroll = useCallback((source: 'left' | 'right') => {
    if (!syncEnabled || isScrolling.current) return;
    
    isScrolling.current = true;
    const sourceEl = source === 'left' ? leftRef.current : rightRef.current;
    const targetEl = source === 'left' ? rightRef.current : leftRef.current;
    
    if (sourceEl && targetEl) {
      // Sync by percentage
      const scrollPercentage = sourceEl.scrollTop / 
        (sourceEl.scrollHeight - sourceEl.clientHeight);
      targetEl.scrollTop = scrollPercentage * 
        (targetEl.scrollHeight - targetEl.clientHeight);
    }
    
    requestAnimationFrame(() => {
      isScrolling.current = false;
    });
  }, [syncEnabled]);
  
  return (
    <SplitPanel
      left={
        <div
          ref={leftRef}
          className="h-full overflow-auto"
          onScroll={() => syncScroll('left')}
        >
          {leftContent}
        </div>
      }
      right={
        <div
          ref={rightRef}
          className="h-full overflow-auto"
          onScroll={() => syncScroll('right')}
        >
          {rightContent}
        </div>
      }
    />
  );
}
```

### Responsive Split Layout

```tsx
interface ResponsiveSplitProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  breakpoint?: number;
  primaryLabel: string;
  secondaryLabel: string;
}

function ResponsiveSplit({
  primary,
  secondary,
  breakpoint = 768,
  primaryLabel,
  secondaryLabel,
}: ResponsiveSplitProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activePanel, setActivePanel] = useState<'primary' | 'secondary'>('primary');
  
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoint]);
  
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {/* Mobile tabs */}
        <div className="flex border-b border-border-theme-subtle">
          <button
            onClick={() => setActivePanel('primary')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activePanel === 'primary' 
                ? 'text-accent border-b-2 border-accent' 
                : 'text-text-theme-secondary'
            }`}
          >
            {primaryLabel}
          </button>
          <button
            onClick={() => setActivePanel('secondary')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activePanel === 'secondary' 
                ? 'text-accent border-b-2 border-accent' 
                : 'text-text-theme-secondary'
            }`}
          >
            {secondaryLabel}
          </button>
        </div>
        
        {/* Mobile content */}
        <div className="flex-1 overflow-hidden">
          {activePanel === 'primary' ? primary : secondary}
        </div>
      </div>
    );
  }
  
  return (
    <SplitPanel
      left={primary}
      right={secondary}
      defaultLeftWidth={50}
    />
  );
}
```

---

## Layout Presets

```typescript
const SPLIT_PRESETS = {
  // Common ratios
  equal: { left: 50, right: 50 },
  goldenLeft: { left: 62, right: 38 },
  goldenRight: { left: 38, right: 62 },
  sidebarLeft: { left: 25, right: 75 },
  sidebarRight: { left: 75, right: 25 },
  
  // IDE-style
  fileTree: { left: 20, right: 80 },
  properties: { left: 70, right: 30 },
};
```

---

## Anti-Patterns

### DON'T: Content Overflow During Resize
```tsx
// BAD - Content overflows during resize
<div style={{ width: `${width}px` }}>
  {content}
</div>

// GOOD - Hidden overflow with proper containment
<div 
  style={{ width: `${width}px` }}
  className="overflow-hidden"
>
  <div className="w-full h-full overflow-auto">
    {content}
  </div>
</div>
```

### DON'T: No Minimum Size
```tsx
// BAD - Panel can be crushed to 0
const newWidth = (e.clientX / containerWidth) * 100;
setWidth(newWidth);

// GOOD - Enforce minimum
const newWidth = Math.max(MIN_WIDTH, (e.clientX / containerWidth) * 100);
setWidth(newWidth);
```

### DON'T: No Visual Divider Feedback
```tsx
// BAD - Divider looks static
<div className="w-1 bg-gray-300" />

// GOOD - Clear interaction feedback
<div className={`
  w-1 bg-gray-300 
  cursor-col-resize 
  hover:bg-accent 
  transition-colors
  ${isDragging ? 'bg-accent' : ''}
`} />
```

---

## Accessibility

### ARIA for Separators

```tsx
<div
  role="separator"
  aria-orientation="vertical"
  aria-valuenow={leftWidthPercent}
  aria-valuemin={minWidth}
  aria-valuemax={maxWidth}
  aria-label="Resize panels. Use left and right arrow keys."
  tabIndex={0}
  onKeyDown={handleKeyboard}
/>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft` | Decrease left panel width |
| `ArrowRight` | Increase left panel width |
| `Home` | Set to minimum |
| `End` | Set to maximum |
| `Enter` | Toggle collapse |

---

## Testing Checklist

- [ ] Divider draggable with mouse
- [ ] Resize respects min/max constraints
- [ ] Double-click resets to default
- [ ] Keyboard resize works
- [ ] Collapse/expand animates smoothly
- [ ] Panels scroll independently
- [ ] Responsive layout stacks on mobile
- [ ] Panel size persists across sessions
- [ ] Content doesn't flicker during resize
- [ ] Screen reader announces panel changes

---

## Related Skills

- `comparison-patterns` - For side-by-side views
- `editor-workspace-patterns` - For IDE layouts
- `mobile-responsive-ux` - For mobile adaptation
