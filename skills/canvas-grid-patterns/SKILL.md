# Canvas & Grid UI Patterns

Patterns for interactive canvas-based UIs including hex grids, tactical maps, game boards, and SVG-based graphics. These patterns apply to any application with spatial/coordinate-based interaction.

## When to Use This Skill

- Tactical/strategy game maps
- Hex-based or square-based grids
- Interactive diagrams with selectable elements
- Map editors or level designers
- Any SVG/Canvas-based interactive graphics
- Floor planners, seating charts
- Network topology visualizers

---

## Core Concepts

### Coordinate Systems

| System | Use Case | Formula |
|--------|----------|---------|
| **Axial (q,r)** | Hex grids | Most efficient for hex math |
| **Cube (x,y,z)** | Hex algorithms | x + y + z = 0 constraint |
| **Offset (col,row)** | Square grids | Direct mapping to pixels |
| **Cartesian (x,y)** | Canvas/SVG | Pixel coordinates |

### Hex Grid Math Reference

```typescript
// Axial to Pixel (flat-top hex)
function hexToPixel(hex: {q: number, r: number}, size: number) {
  const x = size * (3/2) * hex.q;
  const y = size * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

// Pixel to Axial (with rounding)
function pixelToHex(x: number, y: number, size: number) {
  const q = (2/3 * x) / size;
  const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
  return roundHex(q, r);
}
```

---

## Audit Checklist

### Grid Rendering
- [ ] [CRITICAL] Grid cells render correctly at all zoom levels
- [ ] [CRITICAL] Coordinate system consistent throughout
- [ ] [MAJOR] Grid lines visible but not overpowering
- [ ] [MAJOR] Cell highlighting on hover
- [ ] [MINOR] Coordinate labels toggleable
- [ ] [MINOR] Grid snapping for placed elements

### Pan & Zoom Controls
- [ ] [CRITICAL] Mouse wheel zooms (with configurable sensitivity)
- [ ] [CRITICAL] Drag to pan (middle-click or alt+drag)
- [ ] [CRITICAL] Zoom has min/max limits (prevent losing view)
- [ ] [MAJOR] Zoom controls visible (+ / - / reset buttons)
- [ ] [MAJOR] Zoom centers on cursor position
- [ ] [MAJOR] Reset view button returns to default
- [ ] [MINOR] Pinch-to-zoom on touch devices
- [ ] [MINOR] Zoom level indicator visible
- [ ] [MINOR] Smooth zoom animation (not jumpy)

### Token/Marker Display
- [ ] [CRITICAL] Tokens clearly distinguish between types/teams
- [ ] [CRITICAL] Selected token has obvious visual indicator
- [ ] [MAJOR] Tokens scale appropriately with zoom
- [ ] [MAJOR] Token labels readable at normal zoom
- [ ] [MINOR] Tokens have hover tooltip with details
- [ ] [MINOR] Destroyed/disabled tokens visually distinct

### Selection & Interaction
- [ ] [CRITICAL] Click on cell triggers selection callback
- [ ] [CRITICAL] Click on token triggers separate callback
- [ ] [MAJOR] Selected cell visually highlighted
- [ ] [MAJOR] Selection persists until explicitly changed
- [ ] [MAJOR] Multi-select supported (if applicable)
- [ ] [MINOR] Selection box for area selection
- [ ] [MINOR] Keyboard navigation between cells (arrow keys)

### Range/Area Visualization
- [ ] [CRITICAL] Movement range uses distinct color (green/blue)
- [ ] [CRITICAL] Attack range uses distinct color (red/orange)
- [ ] [MAJOR] Overlapping ranges visually distinguishable
- [ ] [MAJOR] Range boundaries clear (not bleeding into adjacent cells)
- [ ] [MINOR] Range cost labels (MP remaining) shown on cells
- [ ] [MINOR] Invalid/blocked cells clearly marked

### Directional Indicators
- [ ] [MAJOR] Facing/direction shown on tokens (arrow/wedge)
- [ ] [MAJOR] Direction rotates smoothly with facing changes
- [ ] [MINOR] Direction indicator scales with zoom
- [ ] [MINOR] Arc indicators for line-of-sight/fire arcs

### Path Visualization
- [ ] [MAJOR] Movement path shown during preview
- [ ] [MAJOR] Path highlights intermediate cells
- [ ] [MINOR] Path shows waypoints/turns
- [ ] [MINOR] Path cost accumulation displayed

### Performance
- [ ] [CRITICAL] Large grids (100+ cells) render smoothly
- [ ] [MAJOR] Interaction doesn't lag at normal grid sizes
- [ ] [MAJOR] No visible flicker on state changes
- [ ] [MINOR] Virtualized rendering for very large grids

### Accessibility
- [ ] [CRITICAL] Keyboard alternative for all mouse actions
- [ ] [CRITICAL] Screen reader announces cell contents
- [ ] [MAJOR] Focus indicator visible on current cell
- [ ] [MAJOR] High contrast mode support
- [ ] [MINOR] Color-blind friendly palette options

---

## Implementation Patterns

### React Component Structure

```tsx
interface GridDisplayProps {
  // Data
  cells: GridCell[];
  tokens: Token[];
  
  // Selection state
  selectedCell: Coordinate | null;
  selectedToken: string | null;
  
  // Overlays
  movementRange?: Coordinate[];
  attackRange?: Coordinate[];
  highlightPath?: Coordinate[];
  
  // Callbacks
  onCellClick?: (coord: Coordinate) => void;
  onCellHover?: (coord: Coordinate | null) => void;
  onTokenClick?: (tokenId: string) => void;
  
  // Display options
  showCoordinates?: boolean;
  showGrid?: boolean;
}
```

### Pan/Zoom State Management

```tsx
const [viewState, setViewState] = useState({
  pan: { x: 0, y: 0 },
  zoom: 1,
});

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

// Zoom handler
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  setViewState(prev => ({
    ...prev,
    zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom * delta))
  }));
};

// Pan handler (alt+drag or middle mouse)
const handleMouseMove = (e: MouseEvent) => {
  if (isPanning) {
    setViewState(prev => ({
      ...prev,
      pan: {
        x: prev.pan.x + e.movementX,
        y: prev.pan.y + e.movementY
      }
    }));
  }
};
```

### SVG ViewBox Calculation

```tsx
const transformedViewBox = useMemo(() => {
  const scale = 1 / zoom;
  const width = baseViewBox.width * scale;
  const height = baseViewBox.height * scale;
  const x = baseViewBox.x - pan.x * scale + (baseViewBox.width - width) / 2;
  const y = baseViewBox.y - pan.y * scale + (baseViewBox.height - height) / 2;
  return `${x} ${y} ${width} ${height}`;
}, [baseViewBox, zoom, pan]);

<svg viewBox={transformedViewBox}>
  {/* Grid and tokens */}
</svg>
```

### Token with Facing Indicator

```tsx
function TokenWithFacing({ token, onClick }: TokenProps) {
  const { x, y } = coordToPixel(token.position);
  const rotation = getFacingRotation(token.facing); // 0, 60, 120, 180, 240, 300 for hex
  
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick}>
      {/* Selection ring */}
      {token.isSelected && (
        <circle r={TOKEN_SIZE * 0.7} fill="none" stroke="#fbbf24" strokeWidth={3} />
      )}
      
      {/* Token body */}
      <circle r={TOKEN_SIZE * 0.5} fill={token.teamColor} stroke="#1e293b" strokeWidth={2} />
      
      {/* Facing indicator (arrow) */}
      <g transform={`rotate(${rotation - 90})`}>
        <path d="M0,-20 L8,-8 L0,-12 L-8,-8 Z" fill="white" stroke="#1e293b" />
      </g>
      
      {/* Label */}
      <text y={4} textAnchor="middle" fontSize={10} fill="white">
        {token.label}
      </text>
    </g>
  );
}
```

### Movement Range Overlay

```tsx
function MovementRangeOverlay({ range, onCellClick }: RangeProps) {
  return (
    <g className="movement-range">
      {range.map(({ coord, mpCost, reachable }) => {
        const { x, y } = coordToPixel(coord);
        return (
          <g key={coordKey(coord)} onClick={() => onCellClick(coord)}>
            <path
              d={hexPath(x, y)}
              fill={reachable ? "rgba(34, 197, 94, 0.3)" : "rgba(107, 114, 128, 0.2)"}
              stroke={reachable ? "#22c55e" : "#6b7280"}
              strokeWidth={1}
            />
            {reachable && (
              <text x={x} y={y + 4} textAnchor="middle" fontSize={9} fill="#166534">
                {mpCost}MP
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
```

---

## Color Schemes

### Default Grid Colors

```typescript
const GRID_COLORS = {
  // Cell states
  cellDefault: '#1e293b',      // Dark slate
  cellHover: '#334155',        // Lighter slate
  cellSelected: '#3b82f6',     // Blue
  gridLine: '#475569',         // Medium slate
  
  // Range overlays
  movementRange: 'rgba(34, 197, 94, 0.3)',   // Green 30%
  attackRange: 'rgba(239, 68, 68, 0.3)',     // Red 30%
  pathHighlight: 'rgba(59, 130, 246, 0.5)', // Blue 50%
  
  // Token colors
  playerToken: '#3b82f6',      // Blue
  opponentToken: '#ef4444',    // Red
  neutralToken: '#6b7280',     // Gray
  destroyedToken: '#374151',   // Dark gray
  
  // Indicators
  selectionRing: '#fbbf24',    // Amber
  targetRing: '#f87171',       // Light red
};
```

---

## Anti-Patterns

### DON'T: Unbounded Zoom
```tsx
// BAD - User can zoom infinitely
setZoom(prev => prev * delta);

// GOOD - Clamp to reasonable bounds
setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
```

### DON'T: Zoom Relative to Center Only
```tsx
// BAD - Always zooms to center, disorienting
const newViewBox = { ...viewBox, width: viewBox.width * scale };

// GOOD - Zoom toward cursor position
const cursorInSvg = screenToSvg(cursorPosition);
// Adjust pan to keep cursor position stable
```

### DON'T: Missing Reset Button
```tsx
// BAD - User gets lost, no way to recover
<ZoomControls onZoomIn={...} onZoomOut={...} />

// GOOD - Always provide reset
<ZoomControls 
  onZoomIn={...} 
  onZoomOut={...} 
  onReset={() => setViewState({ pan: { x: 0, y: 0 }, zoom: 1 })}
/>
```

### DON'T: No Keyboard Alternatives
```tsx
// BAD - Mouse-only interaction
<HexCell onClick={handleClick} />

// GOOD - Full keyboard support
<HexCell 
  onClick={handleClick}
  onKeyDown={e => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  role="gridcell"
  aria-label={`Cell ${coord.q}, ${coord.r}`}
/>
```

---

## Testing Checklist

- [ ] Grid renders correct number of cells for given radius
- [ ] Zoom stays within min/max bounds
- [ ] Pan works with middle mouse and alt+drag
- [ ] Reset view returns to default state
- [ ] Cell click returns correct coordinates
- [ ] Token click returns correct token ID
- [ ] Selection state updates correctly
- [ ] Range overlays display on correct cells
- [ ] Path visualization follows expected route
- [ ] Keyboard navigation moves between cells
- [ ] Performance acceptable with 100+ cells

---

## Related Skills

- `drag-drop-patterns` - For token dragging within grid
- `keyboard-shortcuts-patterns` - For grid keyboard navigation
- `mobile-responsive-ux` - For touch gesture support
