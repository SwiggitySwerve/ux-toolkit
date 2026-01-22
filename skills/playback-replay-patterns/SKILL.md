# Playback & Replay UI Patterns

Patterns for VCR-style playback controls, timeline scrubbing, replay viewers, and media-like navigation. Applies to video players, game replays, animation timelines, event history browsers, and debugging tools.

## When to Use This Skill

- Game replay viewers
- Video/audio players
- Animation timeline editors
- Event log replay (debugging)
- Time-travel debugging
- Presentation/slideshow controls
- Data visualization playback
- Historical data scrubbing

---

## Core Concepts

### Playback States

| State | Description | Visual Indicator |
|-------|-------------|------------------|
| **Stopped** | At beginning, not playing | Stop icon, progress at 0 |
| **Playing** | Auto-advancing through timeline | Play icon animating |
| **Paused** | Frozen at current position | Pause icon, position preserved |
| **Buffering** | Loading next content | Spinner/loading indicator |
| **Ended** | Reached end of timeline | Replay option |

### Speed Options

```typescript
const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4] as const;

function formatSpeed(speed: number): string {
  if (speed === 1) return '1x';
  if (speed < 1) return `${speed}x (slow)`;
  return `${speed}x (fast)`;
}
```

---

## Audit Checklist

### Core Controls
- [ ] [CRITICAL] Play/Pause toggle button (single button, changes icon)
- [ ] [CRITICAL] Stop button (returns to start)
- [ ] [CRITICAL] Controls accessible via keyboard (Space = play/pause)
- [ ] [MAJOR] Step forward (advance one frame/event)
- [ ] [MAJOR] Step backward (go back one frame/event)
- [ ] [MINOR] Go to start button
- [ ] [MINOR] Go to end button

### Timeline/Progress
- [ ] [CRITICAL] Progress bar showing current position
- [ ] [CRITICAL] Click on timeline to seek to position
- [ ] [MAJOR] Drag scrubber for precise seeking
- [ ] [MAJOR] Current time/position displayed
- [ ] [MAJOR] Total duration/length displayed
- [ ] [MINOR] Thumbnail preview on hover (for video)
- [ ] [MINOR] Event markers on timeline

### Speed Control
- [ ] [MAJOR] Speed selector dropdown or buttons
- [ ] [MAJOR] Current speed displayed
- [ ] [MINOR] Keyboard shortcuts for speed (+/-)
- [ ] [MINOR] Speed persists across sessions

### Event/Frame Information
- [ ] [MAJOR] Current event/frame details shown
- [ ] [MAJOR] Sequence number displayed (e.g., "Event 5 of 120")
- [ ] [MINOR] Event type/category indicator
- [ ] [MINOR] Timestamp of current event

### Keyboard Shortcuts
- [ ] [CRITICAL] Space = Play/Pause
- [ ] [MAJOR] Left/Right arrows = Step backward/forward
- [ ] [MAJOR] Cmd/Ctrl+Left/Right = Jump to start/end
- [ ] [MINOR] [ / ] = Decrease/increase speed
- [ ] [MINOR] Escape = Stop
- [ ] [MINOR] Shortcuts discoverable (help modal)

### Visual Feedback
- [ ] [CRITICAL] Playing state obviously different from paused
- [ ] [MAJOR] Progress updates smoothly during playback
- [ ] [MAJOR] Seeking provides immediate visual feedback
- [ ] [MINOR] Speed change confirmation (toast/indicator)
- [ ] [MINOR] Animation on state transitions

### Accessibility
- [ ] [CRITICAL] All controls keyboard accessible
- [ ] [CRITICAL] ARIA labels on all buttons
- [ ] [MAJOR] Screen reader announces state changes
- [ ] [MAJOR] Focus visible on all controls
- [ ] [MINOR] High contrast mode support
- [ ] [MINOR] Controls work with reduced motion

---

## Implementation Patterns

### Playback State Hook

```typescript
type PlaybackState = 'stopped' | 'playing' | 'paused';

interface UseReplayPlayerOptions {
  events: readonly Event[];
  initialIndex?: number;
  autoPlay?: boolean;
  baseInterval?: number; // ms between events at 1x speed
}

interface UseReplayPlayerReturn {
  // State
  playbackState: PlaybackState;
  currentIndex: number;
  currentEvent: Event | null;
  progress: number; // 0-100
  speed: number;
  totalEvents: number;
  
  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToIndex: (index: number) => void;
  jumpToEvent: (eventId: string) => void;
  seek: (progress: number) => void; // 0-100
  setSpeed: (speed: number) => void;
}

function useReplayPlayer({
  events,
  initialIndex = 0,
  autoPlay = false,
  baseInterval = 1000,
}: UseReplayPlayerOptions): UseReplayPlayerReturn {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    autoPlay ? 'playing' : 'stopped'
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [speed, setSpeed] = useState(1);
  
  // Auto-advance interval
  useEffect(() => {
    if (playbackState !== 'playing') return;
    if (currentIndex >= events.length - 1) {
      setPlaybackState('paused');
      return;
    }
    
    const interval = baseInterval / speed;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, interval);
    
    return () => clearTimeout(timer);
  }, [playbackState, currentIndex, speed, baseInterval, events.length]);
  
  const play = useCallback(() => {
    if (currentIndex >= events.length - 1) {
      setCurrentIndex(0); // Restart if at end
    }
    setPlaybackState('playing');
  }, [currentIndex, events.length]);
  
  const pause = useCallback(() => setPlaybackState('paused'), []);
  
  const stop = useCallback(() => {
    setPlaybackState('stopped');
    setCurrentIndex(0);
  }, []);
  
  const stepForward = useCallback(() => {
    setPlaybackState('paused');
    setCurrentIndex(prev => Math.min(prev + 1, events.length - 1));
  }, [events.length]);
  
  const stepBackward = useCallback(() => {
    setPlaybackState('paused');
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);
  
  const seek = useCallback((progress: number) => {
    const index = Math.round((progress / 100) * (events.length - 1));
    setCurrentIndex(index);
  }, [events.length]);
  
  return {
    playbackState,
    currentIndex,
    currentEvent: events[currentIndex] ?? null,
    progress: events.length > 1 ? (currentIndex / (events.length - 1)) * 100 : 0,
    speed,
    totalEvents: events.length,
    play,
    pause,
    stop,
    stepForward,
    stepBackward,
    jumpToIndex: setCurrentIndex,
    jumpToEvent: (id) => {
      const idx = events.findIndex(e => e.id === id);
      if (idx >= 0) setCurrentIndex(idx);
    },
    seek,
    setSpeed,
  };
}
```

### Replay Controls Component

```tsx
interface ReplayControlsProps {
  playbackState: PlaybackState;
  canStepBackward: boolean;
  canStepForward: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
}

function ReplayControls({
  playbackState,
  canStepBackward,
  canStepForward,
  onPlay,
  onPause,
  onStop,
  onStepForward,
  onStepBackward,
}: ReplayControlsProps) {
  const isPlaying = playbackState === 'playing';
  
  return (
    <div 
      className="flex items-center gap-2"
      role="group"
      aria-label="Playback controls"
    >
      {/* Stop */}
      <button
        onClick={onStop}
        className="p-2 rounded-lg hover:bg-surface-raised"
        aria-label="Stop and return to start"
        title="Stop (Esc)"
      >
        <StopIcon className="w-5 h-5" />
      </button>
      
      {/* Step Backward */}
      <button
        onClick={onStepBackward}
        disabled={!canStepBackward}
        className="p-2 rounded-lg hover:bg-surface-raised disabled:opacity-50"
        aria-label="Step backward"
        title="Previous event (Left arrow)"
      >
        <StepBackIcon className="w-5 h-5" />
      </button>
      
      {/* Play/Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="p-3 rounded-full bg-accent hover:bg-accent/80"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? (
          <PauseIcon className="w-6 h-6 text-white" />
        ) : (
          <PlayIcon className="w-6 h-6 text-white" />
        )}
      </button>
      
      {/* Step Forward */}
      <button
        onClick={onStepForward}
        disabled={!canStepForward}
        className="p-2 rounded-lg hover:bg-surface-raised disabled:opacity-50"
        aria-label="Step forward"
        title="Next event (Right arrow)"
      >
        <StepForwardIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
```

### Timeline Component

```tsx
interface ReplayTimelineProps {
  progress: number; // 0-100
  markers?: TimelineMarker[];
  onSeek: (progress: number) => void;
  currentSequence?: number;
}

interface TimelineMarker {
  position: number; // 0-100
  color: string;
  label: string;
}

function ReplayTimeline({ progress, markers = [], onSeek, currentSequence }: ReplayTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, position)));
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setHoverPosition(Math.max(0, Math.min(100, position)));
    
    if (isDragging) {
      onSeek(position);
    }
  };
  
  return (
    <div className="w-full">
      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-2 bg-gray-700 rounded-full cursor-pointer"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPosition(null)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        role="slider"
        aria-label="Playback position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        
        {/* Hover indicator */}
        {hoverPosition !== null && (
          <div
            className="absolute top-0 h-full w-0.5 bg-white/50"
            style={{ left: `${hoverPosition}%` }}
          />
        )}
        
        {/* Markers */}
        {markers.map((marker, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ 
              left: `${marker.position}%`, 
              backgroundColor: marker.color,
              transform: 'translate(-50%, -50%)'
            }}
            title={marker.label}
          />
        ))}
        
        {/* Scrubber handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-accent"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      
      {/* Position label */}
      {currentSequence !== undefined && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Event {currentSequence}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}
```

### Speed Selector Component

```tsx
const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4] as const;

interface ReplaySpeedSelectorProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

function ReplaySpeedSelector({ speed, onSpeedChange }: ReplaySpeedSelectorProps) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
      {PLAYBACK_SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onSpeedChange(s)}
          className={`
            px-2 py-1 text-xs rounded transition-colors
            ${speed === s 
              ? 'bg-accent text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }
          `}
          aria-pressed={speed === s}
          aria-label={`${s}x speed`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
```

### Keyboard Shortcuts Hook

```tsx
interface UseReplayKeyboardShortcutsOptions {
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  playbackState: PlaybackState;
  enabled?: boolean;
}

function useReplayKeyboardShortcuts({
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onSpeedUp,
  onSpeedDown,
  onGoToStart,
  onGoToEnd,
  playbackState,
  enabled = true,
}: UseReplayKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          playbackState === 'playing' ? onPause() : onPlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.metaKey || e.ctrlKey) {
            onGoToStart();
          } else {
            onStepBackward();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.metaKey || e.ctrlKey) {
            onGoToEnd();
          } else {
            onStepForward();
          }
          break;
        case '[':
          e.preventDefault();
          onSpeedDown();
          break;
        case ']':
          e.preventDefault();
          onSpeedUp();
          break;
        case 'Escape':
          e.preventDefault();
          onGoToStart();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, playbackState, onPlay, onPause, onStepForward, onStepBackward, onSpeedUp, onSpeedDown, onGoToStart, onGoToEnd]);
}
```

---

## Visual States

### Control Button States

```typescript
const CONTROL_STATES = {
  default: {
    bg: 'bg-transparent',
    hover: 'hover:bg-surface-raised',
    text: 'text-gray-400',
  },
  active: {
    bg: 'bg-accent',
    hover: 'hover:bg-accent/80',
    text: 'text-white',
  },
  disabled: {
    bg: 'bg-transparent',
    hover: '',
    text: 'text-gray-600',
    cursor: 'cursor-not-allowed',
  },
};
```

### Playback State Indicators

```typescript
const PLAYBACK_INDICATORS = {
  stopped: {
    text: 'Stopped',
    color: 'text-gray-400',
    icon: 'stop',
  },
  playing: {
    text: 'Playing',
    color: 'text-emerald-400',
    icon: 'play',
    pulse: true,
  },
  paused: {
    text: 'Paused',
    color: 'text-amber-400',
    icon: 'pause',
  },
};
```

---

## Anti-Patterns

### DON'T: Separate Play and Pause Buttons
```tsx
// BAD - Takes up space, confusing
<button onClick={play}>Play</button>
<button onClick={pause}>Pause</button>

// GOOD - Single toggle button
<button onClick={isPlaying ? pause : play}>
  {isPlaying ? <PauseIcon /> : <PlayIcon />}
</button>
```

### DON'T: No Keyboard Support
```tsx
// BAD - Mouse only
<div onClick={handleSeek}>...</div>

// GOOD - Full keyboard support
<div 
  onClick={handleSeek}
  onKeyDown={e => e.key === 'Enter' && handleSeek(e)}
  tabIndex={0}
  role="slider"
  aria-label="Seek"
>...</div>
```

### DON'T: Hidden Progress Information
```tsx
// BAD - No indication of position
<ProgressBar progress={progress} />

// GOOD - Clear position indication
<div>
  <ProgressBar progress={progress} />
  <span>Event {current} of {total} ({Math.round(progress)}%)</span>
</div>
```

### DON'T: No Speed Indication
```tsx
// BAD - Speed selector without current value
<SpeedSelector onChange={setSpeed} />

// GOOD - Current speed always visible
<div className="flex items-center gap-2">
  <span className="text-sm text-gray-400">Speed:</span>
  <SpeedSelector speed={speed} onChange={setSpeed} />
</div>
```

---

## Accessibility

### ARIA Attributes

```tsx
// Progress bar
<div
  role="slider"
  aria-label="Playback progress"
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={progress}
  aria-valuetext={`${currentIndex + 1} of ${totalEvents} events`}
  tabIndex={0}
>

// Play/Pause button
<button
  aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
  aria-pressed={isPlaying}
>

// Speed selector
<div role="group" aria-label="Playback speed selection">
  <button aria-pressed={speed === 1} aria-label="Normal speed">1x</button>
  <button aria-pressed={speed === 2} aria-label="Double speed">2x</button>
</div>
```

### Screen Reader Announcements

```tsx
function usePlaybackAnnouncements(playbackState: PlaybackState, currentIndex: number) {
  const prevState = useRef(playbackState);
  
  useEffect(() => {
    if (playbackState !== prevState.current) {
      const messages = {
        playing: 'Playback started',
        paused: `Playback paused at event ${currentIndex + 1}`,
        stopped: 'Playback stopped, returned to start',
      };
      announceToScreenReader(messages[playbackState]);
      prevState.current = playbackState;
    }
  }, [playbackState, currentIndex]);
}
```

---

## Testing Checklist

- [ ] Play starts playback from current position
- [ ] Pause stops playback without changing position
- [ ] Stop returns to position 0
- [ ] Step forward advances by one event
- [ ] Step backward goes back by one event
- [ ] Seek jumps to clicked position
- [ ] Speed changes affect playback rate
- [ ] Space bar toggles play/pause
- [ ] Arrow keys step forward/backward
- [ ] Progress bar updates during playback
- [ ] Position indicator shows correct event number
- [ ] Controls disable at appropriate boundaries

---

## Related Skills

- `event-timeline-patterns` - For event list display
- `keyboard-shortcuts-patterns` - For shortcut implementation
- `turn-based-ui-patterns` - For game replay context
