# Turn-Based & Phase UI Patterns

Patterns for turn-based games, phase-driven workflows, and sequential state machines. Applies to strategy games, board games, approval workflows, and any UI with distinct phases or turns.

## When to Use This Skill

- Turn-based strategy games (XCOM, Civilization, BattleTech)
- Board game implementations
- Multi-step approval workflows
- Wizard/stepper with dependent phases
- Auction/bidding systems
- Real-time strategy games with pause
- Collaborative editing with turn-taking

---

## Core Concepts

### Phase vs Turn vs Round

| Term | Definition | Example |
|------|------------|---------|
| **Phase** | Distinct action type within a turn | Movement Phase, Attack Phase, End Phase |
| **Turn** | One player's complete action sequence | Player 1's turn, Player 2's turn |
| **Round** | Complete cycle of all players' turns | Round 1 = All players take one turn |

### Phase Flow Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Linear** | Phases always in same order | Most board games |
| **Conditional** | Some phases may be skipped | MTG: Skip combat if no creatures |
| **Parallel** | Multiple phases can be active | RTS games with simultaneous actions |
| **Interruptible** | Opponent can interrupt phases | Stack-based card games |

---

## Audit Checklist

### Phase Banner/Indicator
- [ ] [CRITICAL] Current phase clearly displayed at all times
- [ ] [CRITICAL] Phase name readable and prominent
- [ ] [MAJOR] Visual distinction between phases (color/icon)
- [ ] [MAJOR] Phase transition is obvious (animation/sound)
- [ ] [MINOR] Phase description/tooltip explains what can be done
- [ ] [MINOR] Upcoming phase indicated (next phase preview)

### Turn Indicator
- [ ] [CRITICAL] Whose turn it is clearly shown
- [ ] [CRITICAL] Active player highlighted in player list
- [ ] [MAJOR] Turn number displayed
- [ ] [MAJOR] Different styling for "your turn" vs "opponent's turn"
- [ ] [MINOR] Turn timer (if applicable)
- [ ] [MINOR] Turn history accessible

### Action Availability
- [ ] [CRITICAL] Available actions clearly enabled
- [ ] [CRITICAL] Unavailable actions clearly disabled (grayed out)
- [ ] [MAJOR] Reason for unavailability shown (tooltip/message)
- [ ] [MAJOR] No clickable actions that do nothing
- [ ] [MINOR] Keyboard shortcuts for common actions
- [ ] [MINOR] Action cost displayed (if applicable)

### Phase-Specific Actions
- [ ] [CRITICAL] Action bar changes based on current phase
- [ ] [CRITICAL] Only phase-appropriate actions shown
- [ ] [MAJOR] Default/primary action emphasized
- [ ] [MAJOR] "End Phase" / "Pass" button always accessible
- [ ] [MINOR] Quick action buttons for common operations
- [ ] [MINOR] Action confirmation for irreversible actions

### State Feedback
- [ ] [CRITICAL] Game state updates immediately on action
- [ ] [CRITICAL] Animation indicates what changed
- [ ] [MAJOR] Sound feedback for actions (if applicable)
- [ ] [MAJOR] Undo available within phase (if allowed by rules)
- [ ] [MINOR] Action log shows what happened
- [ ] [MINOR] Pending actions queue visible

### Waiting States
- [ ] [CRITICAL] Clear indication when waiting for opponent
- [ ] [MAJOR] "Opponent is thinking..." or similar message
- [ ] [MAJOR] Estimated wait time or activity indicator
- [ ] [MINOR] Allow reviewing state while waiting
- [ ] [MINOR] Notification when it's your turn again

### Phase Transitions
- [ ] [CRITICAL] Clear visual/audio cue when phase changes
- [ ] [MAJOR] Brief pause between phases for readability
- [ ] [MAJOR] Auto-advance when phase has no actions
- [ ] [MINOR] Transition animation (slide, fade, etc.)
- [ ] [MINOR] Summary of phase results before moving on

### Error Prevention
- [ ] [CRITICAL] Cannot take actions out of turn
- [ ] [CRITICAL] Cannot perform invalid actions
- [ ] [MAJOR] Confirmation for game-ending actions
- [ ] [MAJOR] Warning for suboptimal moves (optional)
- [ ] [MINOR] "Are you sure?" for skipping phases with unused resources

---

## Implementation Patterns

### Phase State Machine

```typescript
enum GamePhase {
  Initiative = 'INITIATIVE',
  Movement = 'MOVEMENT',
  Attack = 'ATTACK',
  PhysicalAttack = 'PHYSICAL_ATTACK',
  Heat = 'HEAT',
  End = 'END',
}

interface PhaseConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  allowedActions: ActionType[];
  canSkip: boolean;
  autoAdvance: boolean; // Auto-advance when no actions available
}

const PHASE_CONFIG: Record<GamePhase, PhaseConfig> = {
  [GamePhase.Movement]: {
    name: 'Movement Phase',
    description: 'Move your units across the battlefield',
    icon: 'move',
    color: 'blue',
    allowedActions: ['move', 'stand', 'prone', 'sprint'],
    canSkip: true,
    autoAdvance: false,
  },
  [GamePhase.Attack]: {
    name: 'Weapon Attack Phase',
    description: 'Fire weapons at enemy targets',
    icon: 'target',
    color: 'red',
    allowedActions: ['fire', 'aim', 'torso_twist'],
    canSkip: true,
    autoAdvance: false,
  },
  // ... more phases
};
```

### Phase Banner Component

```tsx
interface PhaseBannerProps {
  phase: GamePhase;
  turn: number;
  activeSide: 'player' | 'opponent';
  isPlayerTurn: boolean;
}

function PhaseBanner({ phase, turn, activeSide, isPlayerTurn }: PhaseBannerProps) {
  const config = PHASE_CONFIG[phase];
  
  return (
    <div 
      className={`
        flex items-center justify-between px-6 py-3
        ${isPlayerTurn ? 'bg-blue-900' : 'bg-gray-800'}
        border-b-2 ${isPlayerTurn ? 'border-blue-500' : 'border-gray-600'}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Turn Info */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Turn {turn}</span>
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${isPlayerTurn 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-amber-500/20 text-amber-400'
          }
        `}>
          {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
      </div>
      
      {/* Phase Info */}
      <div className="flex items-center gap-3">
        <PhaseIcon phase={phase} className="w-6 h-6" style={{ color: config.color }} />
        <div>
          <div className="font-semibold text-white">{config.name}</div>
          <div className="text-xs text-gray-400">{config.description}</div>
        </div>
      </div>
      
      {/* Phase Progress */}
      <PhaseProgressIndicator currentPhase={phase} />
    </div>
  );
}
```

### Phase Progress Indicator

```tsx
function PhaseProgressIndicator({ currentPhase }: { currentPhase: GamePhase }) {
  const phases = Object.values(GamePhase);
  const currentIndex = phases.indexOf(currentPhase);
  
  return (
    <div className="flex items-center gap-2" aria-label="Phase progress">
      {phases.map((phase, index) => {
        const config = PHASE_CONFIG[phase];
        const status = index < currentIndex ? 'completed' 
                     : index === currentIndex ? 'current' 
                     : 'upcoming';
        
        return (
          <React.Fragment key={phase}>
            {index > 0 && (
              <div className={`w-8 h-0.5 ${
                status === 'completed' ? 'bg-emerald-500' : 'bg-gray-600'
              }`} />
            )}
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${status === 'current' ? 'bg-accent ring-2 ring-accent/50' : ''}
                ${status === 'completed' ? 'bg-emerald-500' : ''}
                ${status === 'upcoming' ? 'bg-gray-700' : ''}
              `}
              title={config.name}
            >
              <PhaseIcon phase={phase} className="w-4 h-4" />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

### Action Bar Component

```tsx
interface ActionBarProps {
  phase: GamePhase;
  canAct: boolean;
  canUndo: boolean;
  onAction: (action: string) => void;
  onEndPhase: () => void;
  onUndo: () => void;
}

function ActionBar({ phase, canAct, canUndo, onAction, onEndPhase, onUndo }: ActionBarProps) {
  const config = PHASE_CONFIG[phase];
  const actions = config.allowedActions;
  
  return (
    <div 
      className="flex items-center justify-between px-6 py-4 bg-gray-900 border-t border-gray-700"
      role="toolbar"
      aria-label="Phase actions"
    >
      {/* Phase-specific actions */}
      <div className="flex items-center gap-2">
        {actions.map(action => (
          <ActionButton
            key={action}
            action={action}
            disabled={!canAct}
            onClick={() => onAction(action)}
          />
        ))}
      </div>
      
      {/* Universal actions */}
      <div className="flex items-center gap-2">
        {canUndo && (
          <Button variant="ghost" onClick={onUndo}>
            <UndoIcon className="w-4 h-4 mr-2" />
            Undo
          </Button>
        )}
        
        <Button 
          variant="primary" 
          onClick={onEndPhase}
          disabled={!canAct}
        >
          {config.canSkip ? 'End Phase' : 'Continue'}
          <ChevronRightIcon className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
```

### Waiting State Component

```tsx
function WaitingForOpponent({ opponentName, lastAction }: WaitingProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md">
        <div className="animate-pulse mb-4">
          <ClockIcon className="w-12 h-12 mx-auto text-amber-400" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          Waiting for {opponentName}
        </h2>
        
        <p className="text-gray-400 mb-4">
          {lastAction 
            ? `Last action: ${lastAction}` 
            : 'Opponent is thinking...'}
        </p>
        
        <div className="flex justify-center gap-2">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
```

---

## Visual Hierarchy

### Phase Colors

```typescript
const PHASE_COLORS = {
  movement: {
    bg: 'bg-blue-900',
    border: 'border-blue-500',
    text: 'text-blue-400',
    icon: '#3b82f6',
  },
  attack: {
    bg: 'bg-red-900',
    border: 'border-red-500',
    text: 'text-red-400',
    icon: '#ef4444',
  },
  defense: {
    bg: 'bg-emerald-900',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    icon: '#10b981',
  },
  utility: {
    bg: 'bg-purple-900',
    border: 'border-purple-500',
    text: 'text-purple-400',
    icon: '#8b5cf6',
  },
  end: {
    bg: 'bg-gray-800',
    border: 'border-gray-600',
    text: 'text-gray-400',
    icon: '#6b7280',
  },
};
```

### Turn Indicator States

```typescript
const TURN_STATES = {
  yourTurn: {
    label: 'Your Turn',
    color: 'emerald',
    pulse: true,
  },
  opponentTurn: {
    label: "Opponent's Turn",
    color: 'amber',
    pulse: false,
  },
  waiting: {
    label: 'Waiting...',
    color: 'gray',
    pulse: true,
  },
  gameOver: {
    label: 'Game Over',
    color: 'slate',
    pulse: false,
  },
};
```

---

## Anti-Patterns

### DON'T: Hidden Phase Information
```tsx
// BAD - Phase only shown in small text
<span className="text-xs text-gray-500">{phase}</span>

// GOOD - Prominent, always-visible phase banner
<PhaseBanner phase={phase} className="sticky top-0 z-10" />
```

### DON'T: Clickable Disabled Actions
```tsx
// BAD - Looks disabled but accepts clicks
<button className="opacity-50" onClick={handleAction}>Attack</button>

// GOOD - Actually disabled with explanation
<Tooltip content="Cannot attack: No valid targets">
  <button disabled className="opacity-50 cursor-not-allowed">Attack</button>
</Tooltip>
```

### DON'T: Silent Phase Transitions
```tsx
// BAD - Phase changes without notice
setPhase(nextPhase);

// GOOD - Announce transition
setPhase(nextPhase);
announceToScreenReader(`Entering ${PHASE_CONFIG[nextPhase].name}`);
playTransitionSound();
showTransitionAnimation();
```

### DON'T: No Clear Turn Ownership
```tsx
// BAD - Ambiguous whose turn it is
<div>{currentPlayer} is playing</div>

// GOOD - Crystal clear with visual hierarchy
<div className={isYourTurn ? 'bg-emerald-500/20' : 'bg-gray-800'}>
  {isYourTurn 
    ? <span className="text-emerald-400 font-bold">YOUR TURN</span>
    : <span className="text-amber-400">Opponent's Turn</span>
  }
</div>
```

---

## Accessibility

### Screen Reader Announcements

```tsx
function usePhaseAnnouncer(phase: GamePhase, turn: number, isYourTurn: boolean) {
  const prevPhase = useRef(phase);
  
  useEffect(() => {
    if (phase !== prevPhase.current) {
      const message = `${PHASE_CONFIG[phase].name}. ${
        isYourTurn ? 'Your turn to act.' : 'Waiting for opponent.'
      }`;
      announceToScreenReader(message);
      prevPhase.current = phase;
    }
  }, [phase, isYourTurn]);
}
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Confirm action / End phase |
| `Escape` | Cancel current action |
| `Tab` | Navigate between action buttons |
| `1-9` | Quick select action by number |
| `U` | Undo last action |
| `E` | End current phase |

---

## Testing Checklist

- [ ] Phase banner shows correct phase name
- [ ] Turn indicator shows correct player
- [ ] Actions disable when not your turn
- [ ] Phase transition animation plays
- [ ] End Phase advances to next phase
- [ ] Undo reverts last action (if allowed)
- [ ] Cannot take actions out of turn
- [ ] Phase-specific actions change correctly
- [ ] Waiting state shows during opponent's turn
- [ ] Screen reader announces phase changes

---

## Related Skills

- `canvas-grid-patterns` - For game board visualization
- `keyboard-shortcuts-patterns` - For action hotkeys
- `playback-replay-patterns` - For game replay functionality
- `event-timeline-patterns` - For turn history/log
