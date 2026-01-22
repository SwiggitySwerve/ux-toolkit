# Event Timeline UI Patterns

Patterns for chronological event displays, activity logs, history views, and audit trails. Applies to event logs, activity feeds, version history, notification streams, and debugging timelines.

## When to Use This Skill

- Activity feeds / event logs
- Audit trails
- Version history
- Notification centers
- Chat/message history
- Debugging timelines
- Git commit history
- Order/transaction history

---

## Core Concepts

### Event Types

| Type | Icon Color | Use Case |
|------|------------|----------|
| **Info** | Blue | General events, navigation |
| **Success** | Green | Completed actions, achievements |
| **Warning** | Amber | Potential issues, notifications |
| **Error** | Red | Failures, critical events |
| **System** | Gray | Automated events, metadata |

### Display Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Timeline** | Vertical line connecting events | Sequential narrative |
| **List** | Simple list without connectors | Dense logs, search results |
| **Grouped** | Events grouped by date/type | Long histories |
| **Compact** | Single-line per event | Maximum density |

---

## Audit Checklist

### Event Display
- [ ] [CRITICAL] Event type clearly indicated (icon/color)
- [ ] [CRITICAL] Timestamp visible for each event
- [ ] [CRITICAL] Event description readable
- [ ] [MAJOR] Actor/source identified (who did it)
- [ ] [MAJOR] Consistent event formatting
- [ ] [MINOR] Event metadata expandable
- [ ] [MINOR] Raw data accessible (for debugging)

### Chronological Order
- [ ] [CRITICAL] Events sorted correctly (newest first OR oldest first)
- [ ] [CRITICAL] Sort order matches user expectation
- [ ] [MAJOR] Date separators for long timelines
- [ ] [MAJOR] Relative timestamps ("5 min ago")
- [ ] [MINOR] Toggle between relative/absolute time
- [ ] [MINOR] Timezone handling documented

### Filtering & Search
- [ ] [MAJOR] Filter by event type
- [ ] [MAJOR] Filter by date range
- [ ] [MAJOR] Search event content
- [ ] [MINOR] Filter by actor/source
- [ ] [MINOR] Save filter presets
- [ ] [MINOR] Clear all filters button

### Navigation
- [ ] [CRITICAL] Scroll to see more events
- [ ] [MAJOR] Jump to specific event (by ID or link)
- [ ] [MAJOR] Jump to date/time
- [ ] [MINOR] Keyboard navigation (up/down arrows)
- [ ] [MINOR] Infinite scroll OR pagination

### Performance
- [ ] [CRITICAL] Initial load is fast (<100 events visible)
- [ ] [MAJOR] Virtualized list for large datasets
- [ ] [MAJOR] Lazy loading for older events
- [ ] [MINOR] Skeleton loading states
- [ ] [MINOR] Smooth scroll behavior

### Interactivity
- [ ] [MAJOR] Click event for details
- [ ] [MAJOR] Selected event highlighted
- [ ] [MINOR] Copy event ID/link
- [ ] [MINOR] Expand/collapse event details
- [ ] [MINOR] Context menu for actions

### Accessibility
- [ ] [CRITICAL] Events announced to screen readers
- [ ] [CRITICAL] Keyboard navigable
- [ ] [MAJOR] Focus indicator visible
- [ ] [MAJOR] Color not the only type indicator
- [ ] [MINOR] Live region for new events

---

## Implementation Patterns

### Event Item Component

```tsx
interface TimelineEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: string;
  title: string;
  description?: string;
  timestamp: Date;
  actor?: { name: string; avatar?: string };
  metadata?: Record<string, unknown>;
}

interface EventTimelineItemProps {
  event: TimelineEvent;
  isSelected?: boolean;
  onClick?: (event: TimelineEvent) => void;
  showConnector?: boolean;
}

function EventTimelineItem({ 
  event, 
  isSelected, 
  onClick,
  showConnector = true 
}: EventTimelineItemProps) {
  const typeConfig = {
    info: { color: 'blue', icon: InfoIcon },
    success: { color: 'emerald', icon: CheckIcon },
    warning: { color: 'amber', icon: AlertIcon },
    error: { color: 'red', icon: ErrorIcon },
    system: { color: 'gray', icon: GearIcon },
  };
  
  const config = typeConfig[event.type];
  const Icon = config.icon;
  
  return (
    <div 
      className={`
        relative flex gap-4 p-4 cursor-pointer
        hover:bg-surface-raised/50 transition-colors
        ${isSelected ? 'bg-surface-raised border-l-2 border-accent' : ''}
      `}
      onClick={() => onClick?.(event)}
      role="article"
      aria-labelledby={`event-${event.id}-title`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(event)}
    >
      {/* Timeline connector */}
      {showConnector && (
        <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-border-theme-subtle" />
      )}
      
      {/* Event icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        bg-${config.color}-500/20 text-${config.color}-400
      `}>
        <Icon className="w-4 h-4" />
      </div>
      
      {/* Event content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 
              id={`event-${event.id}-title`}
              className="font-medium text-text-theme-primary"
            >
              {event.title}
            </h4>
            {event.description && (
              <p className="text-sm text-text-theme-secondary mt-0.5">
                {event.description}
              </p>
            )}
          </div>
          
          {/* Timestamp */}
          <time 
            dateTime={event.timestamp.toISOString()}
            className="text-xs text-text-theme-muted flex-shrink-0"
            title={event.timestamp.toLocaleString()}
          >
            {formatRelativeTime(event.timestamp)}
          </time>
        </div>
        
        {/* Actor & Category */}
        <div className="flex items-center gap-3 mt-2 text-xs text-text-theme-muted">
          {event.actor && (
            <span className="flex items-center gap-1">
              {event.actor.avatar && (
                <img src={event.actor.avatar} className="w-4 h-4 rounded-full" alt="" />
              )}
              {event.actor.name}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-surface-raised">
            {event.category}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Event Timeline Container

```tsx
interface EventTimelineProps {
  events: readonly TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  selectedEventId?: string;
  maxHeight?: string;
}

function EventTimeline({
  events,
  onEventClick,
  onLoadMore,
  hasMore,
  isLoading,
  selectedEventId,
  maxHeight = '600px',
}: EventTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Infinite scroll detection
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { root: containerRef.current, threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('timeline-sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);
  
  if (events.length === 0) {
    return <EmptyState message="No events found" />;
  }
  
  // Group events by date
  const groupedEvents = groupEventsByDate(events);
  
  return (
    <div 
      ref={containerRef}
      className="overflow-y-auto"
      style={{ maxHeight }}
      role="feed"
      aria-label="Event timeline"
    >
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="sticky top-0 bg-surface-deep px-4 py-2 text-xs font-medium text-text-theme-muted border-b border-border-theme-subtle">
            {formatDateHeader(date)}
          </div>
          
          {/* Events for this date */}
          {dateEvents.map((event, idx) => (
            <EventTimelineItem
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onClick={onEventClick}
              showConnector={idx < dateEvents.length - 1}
            />
          ))}
        </div>
      ))}
      
      {/* Load more sentinel */}
      <div id="timeline-sentinel" className="h-4" />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-text-theme-muted">Loading more...</span>
        </div>
      )}
    </div>
  );
}
```

### Filter Bar Component

```tsx
interface TimelineFiltersProps {
  eventTypes: string[];
  selectedTypes: string[];
  dateRange: { start: Date | null; end: Date | null };
  searchQuery: string;
  onTypeChange: (types: string[]) => void;
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

function TimelineFilters({
  eventTypes,
  selectedTypes,
  dateRange,
  searchQuery,
  onTypeChange,
  onDateRangeChange,
  onSearchChange,
  onClearFilters,
}: TimelineFiltersProps) {
  const hasActiveFilters = selectedTypes.length > 0 || dateRange.start || searchQuery;
  
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-base border-b border-border-theme-subtle">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-theme-muted" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-surface-raised rounded-lg border border-border-theme-subtle"
        />
      </div>
      
      {/* Type filter */}
      <MultiSelect
        options={eventTypes.map(t => ({ value: t, label: t }))}
        selected={selectedTypes}
        onChange={onTypeChange}
        placeholder="Event type"
      />
      
      {/* Date range */}
      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        placeholder="Date range"
      />
      
      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <XIcon className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
```

### Compact Event List

```tsx
function CompactEventList({ events, onEventClick }: CompactListProps) {
  return (
    <div className="divide-y divide-border-theme-subtle">
      {events.map(event => (
        <button
          key={event.id}
          onClick={() => onEventClick?.(event)}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-raised text-left"
        >
          <EventTypeIcon type={event.type} size="sm" />
          <span className="flex-1 truncate text-sm">{event.title}</span>
          <time className="text-xs text-text-theme-muted">
            {formatRelativeTime(event.timestamp)}
          </time>
        </button>
      ))}
    </div>
  );
}
```

---

## Helper Functions

### Relative Time Formatting

```typescript
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  
  return date.toLocaleDateString();
}
```

### Event Grouping

```typescript
function groupEventsByDate(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  return events.reduce((groups, event) => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);
}
```

---

## Anti-Patterns

### DON'T: No Date Context
```tsx
// BAD - Timestamps with no anchor
<span>5 hours ago</span>
<span>3 hours ago</span>

// GOOD - Date separators for context
<DateSeparator>Today</DateSeparator>
<Event time="5 hours ago" />
<DateSeparator>Yesterday</DateSeparator>
<Event time="3 hours ago" />
```

### DON'T: Unvirtualized Long Lists
```tsx
// BAD - Renders 10,000 events at once
{events.map(e => <Event key={e.id} event={e} />)}

// GOOD - Virtualized rendering
<VirtualList
  items={events}
  itemHeight={80}
  renderItem={e => <Event event={e} />}
/>
```

### DON'T: Color-Only Type Indication
```tsx
// BAD - Type only indicated by color
<div className="w-3 h-3 rounded-full bg-red-500" />

// GOOD - Color + icon + label
<div className="flex items-center gap-2">
  <ErrorIcon className="text-red-500" />
  <span className="text-red-400">Error</span>
</div>
```

---

## Accessibility

### Live Region for New Events

```tsx
function EventTimeline({ events }: TimelineProps) {
  const [newEvent, setNewEvent] = useState<string | null>(null);
  
  // Announce new events
  useEffect(() => {
    const latest = events[0];
    if (latest && latest.id !== previousLatestId.current) {
      setNewEvent(`New event: ${latest.title}`);
      previousLatestId.current = latest.id;
    }
  }, [events]);
  
  return (
    <>
      {/* Screen reader announcement */}
      <div aria-live="polite" className="sr-only">
        {newEvent}
      </div>
      
      {/* Timeline content */}
      <div role="feed" aria-label="Event timeline">
        {events.map(event => ...)}
      </div>
    </>
  );
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowDown` | Next event |
| `ArrowUp` | Previous event |
| `Enter` | Select/expand event |
| `Home` | First event |
| `End` | Last event |
| `PageDown` | Skip 10 events forward |
| `PageUp` | Skip 10 events backward |

---

## Testing Checklist

- [ ] Events display in correct chronological order
- [ ] Relative timestamps update correctly
- [ ] Date separators appear between days
- [ ] Filter by type works correctly
- [ ] Search filters event content
- [ ] Infinite scroll loads more events
- [ ] Selected event is highlighted
- [ ] Click on event triggers callback
- [ ] Keyboard navigation works
- [ ] Screen reader announces events

---

## Related Skills

- `playback-replay-patterns` - For event replay
- `list-page-patterns` - For timeline layouts
- `data-density-patterns` - For compact event displays
