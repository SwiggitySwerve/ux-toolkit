# Status Visualization UI Patterns

Patterns for visualizing status, health, progress, and resource values. Applies to health bars, progress indicators, gauges, resource meters, and any numeric status display.

## When to Use This Skill

- Health/HP bars (games)
- Progress bars and indicators
- Resource meters (mana, energy, fuel)
- Capacity gauges (storage, battery)
- Temperature/heat displays
- Skill/stat bars (RPGs)
- Budget/quota tracking
- Performance metrics

---

## Core Concepts

### Visualization Types

| Type | Use Case | Best For |
|------|----------|----------|
| **Bar** | Linear progress, capacity | Health, storage, progress |
| **Pip/Segment** | Discrete units | Lives, charges, armor points |
| **Gauge/Arc** | Circular display | Speed, percentage, completion |
| **Numeric** | Exact values | Stats, scores, counts |
| **Threshold** | Range-based status | Temperature, danger levels |

### Value States

| State | Color | Threshold (typical) |
|-------|-------|---------------------|
| **Healthy/Good** | Green | 75-100% |
| **Warning** | Yellow/Amber | 25-74% |
| **Critical** | Red | 1-24% |
| **Depleted/Zero** | Gray | 0% |
| **Overload** | Purple/Pink | >100% |

---

## Audit Checklist

### Bar/Progress Display
- [ ] [CRITICAL] Current value visually represented
- [ ] [CRITICAL] Maximum value indicated (bar length or number)
- [ ] [MAJOR] Percentage/ratio readable at a glance
- [ ] [MAJOR] Color reflects status (green/yellow/red)
- [ ] [MAJOR] Smooth animation on value change
- [ ] [MINOR] Tooltip with exact values
- [ ] [MINOR] Accessibility: announced to screen readers

### Pip/Segment Display
- [ ] [CRITICAL] Filled vs empty pips clearly distinct
- [ ] [CRITICAL] Total count immediately visible
- [ ] [MAJOR] Consistent pip sizing
- [ ] [MAJOR] Partial pip state (if applicable)
- [ ] [MINOR] Pip groupings for large counts (5s, 10s)
- [ ] [MINOR] Animation on pip change

### Numeric Display
- [ ] [CRITICAL] Current value prominent
- [ ] [CRITICAL] Maximum value visible (if applicable)
- [ ] [MAJOR] Unit/label included
- [ ] [MAJOR] Formatted appropriately (commas, decimals)
- [ ] [MINOR] Change indicator (delta, arrow)
- [ ] [MINOR] Comparison to baseline/previous

### Threshold Indicators
- [ ] [CRITICAL] Current level clearly marked
- [ ] [CRITICAL] Threshold boundaries visible
- [ ] [MAJOR] Labels for each threshold zone
- [ ] [MAJOR] Visual warning at dangerous thresholds
- [ ] [MINOR] Effects list at current threshold
- [ ] [MINOR] Next threshold distance shown

### Color & Contrast
- [ ] [CRITICAL] Status colors distinguishable
- [ ] [CRITICAL] Sufficient contrast (WCAG AA)
- [ ] [MAJOR] Color not the only indicator
- [ ] [MAJOR] Consistent color scheme across app
- [ ] [MINOR] High contrast mode support
- [ ] [MINOR] Color blind friendly alternatives

### Animation & Feedback
- [ ] [MAJOR] Smooth transitions on value change
- [ ] [MAJOR] Flash/pulse on critical threshold
- [ ] [MINOR] Damage/change animation
- [ ] [MINOR] Celebration on full/completion

### Accessibility
- [ ] [CRITICAL] Values announced to screen readers
- [ ] [CRITICAL] Color + text/shape for status
- [ ] [MAJOR] aria-valuenow, aria-valuemin, aria-valuemax
- [ ] [MAJOR] Accessible name for each meter
- [ ] [MINOR] Announce threshold changes

---

## Implementation Patterns

### Progress Bar Component

```tsx
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'segmented';
  animated?: boolean;
}

function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  size = 'md',
  variant = 'default',
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const color = getStatusColor(percentage);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };
  
  return (
    <div className="w-full">
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm text-text-theme-secondary">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-mono text-text-theme-primary">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      
      {/* Bar */}
      <div
        className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={`
            h-full ${color} rounded-full
            ${animated ? 'transition-all duration-300 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getStatusColor(percentage: number): string {
  if (percentage <= 25) return 'bg-red-500';
  if (percentage <= 50) return 'bg-amber-500';
  if (percentage <= 75) return 'bg-yellow-500';
  return 'bg-emerald-500';
}
```

### Health Bar with Damage Animation

```tsx
interface HealthBarProps {
  current: number;
  max: number;
  previousValue?: number;
  showDamage?: boolean;
}

function HealthBar({ current, max, previousValue, showDamage = true }: HealthBarProps) {
  const currentPercent = (current / max) * 100;
  const previousPercent = previousValue ? (previousValue / max) * 100 : currentPercent;
  const damage = previousPercent - currentPercent;
  
  return (
    <div className="relative w-full h-4 bg-gray-800 rounded overflow-hidden">
      {/* Damage flash (shows briefly when taking damage) */}
      {showDamage && damage > 0 && (
        <div
          className="absolute h-full bg-red-400 animate-damage-flash"
          style={{ 
            left: `${currentPercent}%`,
            width: `${damage}%` 
          }}
        />
      )}
      
      {/* Current health */}
      <div
        className={`
          absolute h-full transition-all duration-500 ease-out
          ${currentPercent <= 25 ? 'bg-red-500' : ''}
          ${currentPercent > 25 && currentPercent <= 50 ? 'bg-amber-500' : ''}
          ${currentPercent > 50 ? 'bg-emerald-500' : ''}
        `}
        style={{ width: `${currentPercent}%` }}
      />
      
      {/* Value overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white drop-shadow">
          {current} / {max}
        </span>
      </div>
    </div>
  );
}

// CSS for damage flash animation
// @keyframes damage-flash {
//   0% { opacity: 1; }
//   100% { opacity: 0; width: 0; }
// }
```

### Pip Display Component

```tsx
interface PipDisplayProps {
  filled: number;
  total: number;
  filledColor?: string;
  emptyColor?: string;
  size?: 'sm' | 'md' | 'lg';
  groupSize?: number;
}

function PipDisplay({
  filled,
  total,
  filledColor = 'bg-emerald-500',
  emptyColor = 'bg-gray-600',
  size = 'md',
  groupSize = 5,
}: PipDisplayProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  const pips = [];
  for (let i = 0; i < total; i++) {
    const isFilled = i < filled;
    const isGroupEnd = (i + 1) % groupSize === 0 && i < total - 1;
    
    pips.push(
      <React.Fragment key={i}>
        <span
          className={`
            rounded-full border
            ${sizeClasses[size]}
            ${isFilled 
              ? `${filledColor} border-transparent` 
              : `${emptyColor} border-gray-500`
            }
          `}
          aria-hidden="true"
        />
        {isGroupEnd && <span className="w-1" />}
      </React.Fragment>
    );
  }
  
  return (
    <div 
      className="flex items-center gap-1"
      role="meter"
      aria-valuenow={filled}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${filled} of ${total}`}
    >
      {pips}
    </div>
  );
}
```

### Heat/Temperature Gauge

```tsx
interface HeatGaugeProps {
  heat: number;
  maxHeat: number;
  heatSinks: number;
  thresholds?: HeatThreshold[];
}

interface HeatThreshold {
  value: number;
  label: string;
  effects: string[];
}

const DEFAULT_HEAT_THRESHOLDS: HeatThreshold[] = [
  { value: 0, label: 'Cool', effects: [] },
  { value: 5, label: 'Warm', effects: ['+1 to hit'] },
  { value: 10, label: 'Hot', effects: ['+2 to hit', 'Movement -1'] },
  { value: 15, label: 'Critical', effects: ['+3 to hit', 'Movement -2', 'Shutdown risk'] },
];

function HeatGauge({ 
  heat, 
  maxHeat, 
  heatSinks,
  thresholds = DEFAULT_HEAT_THRESHOLDS 
}: HeatGaugeProps) {
  const percentage = (heat / maxHeat) * 100;
  const currentThreshold = thresholds.reduce((prev, curr) => 
    heat >= curr.value ? curr : prev
  );
  
  const getHeatColor = () => {
    if (heat >= 15) return 'bg-red-500';
    if (heat >= 10) return 'bg-orange-500';
    if (heat >= 5) return 'bg-amber-500';
    return 'bg-cyan-500';
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-text-theme-secondary">
          Heat ({heatSinks} sinks)
        </span>
        <span className={`text-lg font-bold ${heat >= 15 ? 'text-red-400 animate-pulse' : 'text-text-theme-primary'}`}>
          {heat} / {maxHeat}
        </span>
      </div>
      
      {/* Bar with threshold markers */}
      <div className="relative">
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getHeatColor()} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Threshold markers */}
        {thresholds.map((t, idx) => (
          <div
            key={idx}
            className="absolute top-0 h-4 w-0.5 bg-gray-500"
            style={{ left: `${(t.value / maxHeat) * 100}%` }}
            title={t.label}
          />
        ))}
      </div>
      
      {/* Current effects */}
      {currentThreshold.effects.length > 0 && (
        <div className="mt-2 text-xs text-red-400">
          {currentThreshold.effects.join(' • ')}
        </div>
      )}
      
      {/* Dissipation info */}
      <div className="mt-1 text-xs text-text-theme-muted">
        Dissipation: {heatSinks} heat/turn
      </div>
    </div>
  );
}
```

### Stat Block with Bars

```tsx
interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color?: string;
}

function StatBar({ label, current, max, color = 'bg-accent' }: StatBarProps) {
  const percentage = (current / max) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-text-theme-secondary">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-16 text-right text-sm font-mono">
        {current}/{max}
      </span>
    </div>
  );
}

function StatBlock({ stats }: { stats: StatBarProps[] }) {
  return (
    <div className="space-y-2">
      {stats.map((stat, idx) => (
        <StatBar key={idx} {...stat} />
      ))}
    </div>
  );
}
```

### Circular Gauge

```tsx
interface CircularGaugeProps {
  value: number;
  max: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

function CircularGauge({ 
  value, 
  max, 
  label,
  size = 100,
  strokeWidth = 8 
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, (value / max) * 100);
  const offset = circumference - (percentage / 100) * circumference;
  
  const color = percentage <= 25 ? '#ef4444' 
              : percentage <= 50 ? '#f59e0b'
              : '#10b981';
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#374151"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        {label && <span className="text-xs text-text-theme-muted">{label}</span>}
      </div>
    </div>
  );
}
```

---

## Color Systems

### Status Color Scale

```typescript
const STATUS_COLORS = {
  // By percentage
  getByPercentage: (pct: number) => {
    if (pct <= 0) return { bg: 'bg-gray-500', text: 'text-gray-400' };
    if (pct <= 25) return { bg: 'bg-red-500', text: 'text-red-400' };
    if (pct <= 50) return { bg: 'bg-amber-500', text: 'text-amber-400' };
    if (pct <= 75) return { bg: 'bg-yellow-500', text: 'text-yellow-400' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-400' };
  },
  
  // Named states
  healthy: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
  warning: { bg: 'bg-amber-500', text: 'text-amber-400' },
  critical: { bg: 'bg-red-500', text: 'text-red-400' },
  depleted: { bg: 'bg-gray-500', text: 'text-gray-400' },
  overload: { bg: 'bg-violet-500', text: 'text-violet-400' },
};
```

### Heat Color Scale

```typescript
const HEAT_COLORS = {
  cold: 'bg-cyan-500',     // Below normal
  cool: 'bg-blue-500',     // Normal
  warm: 'bg-amber-400',    // Elevated
  hot: 'bg-orange-500',    // High
  critical: 'bg-red-500',  // Dangerous
};
```

---

## Anti-Patterns

### DON'T: No Max Value Reference
```tsx
// BAD - No context for the value
<div className="h-2 bg-green-500" style={{ width: '60%' }} />

// GOOD - Shows current/max
<ProgressBar value={60} max={100} showValue />
```

### DON'T: Color Only
```tsx
// BAD - Status only indicated by color
<div className="w-full h-2 bg-red-500" />

// GOOD - Color + numeric + label
<div>
  <div className="flex justify-between text-sm mb-1">
    <span>Health</span>
    <span className="text-red-400">15/100 (Critical)</span>
  </div>
  <div className="h-2 bg-red-500" style={{ width: '15%' }} />
</div>
```

### DON'T: Instant Jumps
```tsx
// BAD - Value jumps instantly
<div style={{ width: `${percentage}%` }} />

// GOOD - Smooth transition
<div 
  className="transition-all duration-300 ease-out"
  style={{ width: `${percentage}%` }} 
/>
```

---

## Accessibility

### ARIA for Progress/Meters

```tsx
// Progress bar (determinate progress toward goal)
<div
  role="progressbar"
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label="Download progress"
>

// Meter (measurement within known range)
<div
  role="meter"
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label="CPU usage"
>
```

### Announcing Changes

```tsx
function useStatusAnnouncer(value: number, max: number, label: string) {
  const prevValue = useRef(value);
  const percentage = Math.round((value / max) * 100);
  
  useEffect(() => {
    if (value !== prevValue.current) {
      const direction = value > prevValue.current ? 'increased' : 'decreased';
      const status = percentage <= 25 ? 'critical' : percentage <= 50 ? 'warning' : 'normal';
      
      announceToScreenReader(`${label} ${direction} to ${value} of ${max}. Status: ${status}`);
      prevValue.current = value;
    }
  }, [value, max, label, percentage]);
}
```

---

## Testing Checklist

- [ ] Bar fills to correct percentage
- [ ] Color changes at threshold boundaries
- [ ] Animation smooth on value change
- [ ] Value display shows correct numbers
- [ ] Pip display shows correct filled count
- [ ] Circular gauge renders correctly
- [ ] Threshold effects display at correct levels
- [ ] Accessibility attributes present
- [ ] Screen reader announces changes
- [ ] Works in high contrast mode

---

## Related Skills

- `info-card-patterns` - For stat display cards
- `canvas-grid-patterns` - For in-game health displays
- `data-density-patterns` - For dense stat layouts
