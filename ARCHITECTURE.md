# Jamboard-like Application: Technical Architecture & Planning

## 1. Tech Stack Recommendation

### Frontend
- **Framework**: React 18+ with TypeScript
  - Strong typing for complex canvas operations and state management
  - Component-based architecture aligns well with design patterns
- **Canvas Library**: Fabric.js or Konva.js
  - Object-oriented canvas manipulation
  - Built-in support for layers, groups, and serialization
- **State Management**: Zustand or Redux Toolkit
  - For managing board state, slides, and undo/redo stacks
- **Styling**: Tailwind CSS + CSS Modules
  - Minimal, utility-first approach matching Jamboard's aesthetic
- **Build Tool**: Vite
  - Fast development server and optimized production builds

### Backend (if collaboration needed)
- **Runtime**: Node.js with Express or Fastify
- **Real-time**: Socket.io or WebSockets
- **Database**: PostgreSQL (structured data) + Redis (caching/sessions)
- **Storage**: AWS S3 or similar for asset storage

### Alternative: Frontend-Only (MVP)
- LocalStorage/IndexedDB for persistence
- Export/Import JSON for board sharing

---

## 2. Code Structure

```
jamboard-clone/
├── public/
├── src/
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx          # Main board container
│   │   │   ├── Canvas.tsx         # Canvas wrapper
│   │   │   └── Toolbar.tsx        # Drawing tools
│   │   ├── Slides/
│   │   │   ├── SlideBar.tsx       # Horizontal slide navigator
│   │   │   ├── SlideThumbnail.tsx # Individual slide preview
│   │   │   └── SlideManager.tsx   # Add/delete/reorder slides
│   │   ├── Tools/
│   │   │   ├── Pen.tsx
│   │   │   ├── Eraser.tsx
│   │   │   ├── ShapeTool.tsx
│   │   │   ├── TextTool.tsx
│   │   │   └── StickyNote.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── IconButton.tsx
│   │       └── Modal.tsx
│   ├── hooks/
│   │   ├── useBoard.ts            # Board state logic
│   │   ├── useSlides.ts           # Slide management
│   │   ├── useTools.ts            # Tool selection logic
│   │   ├── useHistory.ts          # Undo/redo implementation
│   │   └── useGesture.ts          # Touch/mouse gesture handling
│   ├── store/
│   │   ├── boardStore.ts          # Global board state
│   │   ├── slideStore.ts          # Slide collection state
│   │   └── toolStore.ts           # Active tool state
│   ├── services/
│   │   ├── canvasService.ts       # Canvas operations
│   │   ├── exportService.ts       # PNG/PDF/JSON export
│   │   └── storageService.ts      # Local/cloud persistence
│   ├── utils/
│   │   ├── geometry.ts            # Geometric calculations
│   │   ├── history.ts             # Command pattern for undo/redo
│   │   └── serializer.ts          # Board serialization
│   ├── types/
│   │   ├── board.ts               # Board interfaces
│   │   ├── slide.ts               # Slide interfaces
│   │   ├── tools.ts               # Tool definitions
│   │   └── events.ts              # Event types
│   ├── constants/
│   │   ├── tools.ts               # Tool configurations
│   │   └── colors.ts              # Color palettes
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── package.json
└── tsconfig.json
```

---

## 3. Design Patterns

### A. Command Pattern (Undo/Redo)
```typescript
// Each action is a command object
interface Command {
  execute(): void;
  undo(): void;
}

class AddShapeCommand implements Command {
  private shape: Shape;
  private canvas: Canvas;
  
  execute() { this.canvas.add(this.shape); }
  undo() { this.canvas.remove(this.shape); }
}

// History manager maintains command stack
class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  
  execute(command: Command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo on new action
  }
  
  undo() {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }
}
```

### B. Strategy Pattern (Tools)
```typescript
// Different drawing tools as interchangeable strategies
interface ToolStrategy {
  onMouseDown(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
  onMouseUp(event: MouseEvent): void;
}

class PenTool implements ToolStrategy {
  // Implements freehand drawing logic
}

class ShapeTool implements ToolStrategy {
  // Implements shape creation logic
}

// Context uses the selected strategy
class ToolContext {
  private strategy: ToolStrategy;
  
  setStrategy(strategy: ToolStrategy) {
    this.strategy = strategy;
  }
  
  handleEvent(event: MouseEvent) {
    this.strategy[event.type](event);
  }
}
```

### C. Observer Pattern (State Changes)
```typescript
// Components subscribe to board state changes
class BoardSubject {
  private observers: Observer[] = [];
  
  attach(observer: Observer) {
    this.observers.push(observer);
  }
  
  notify(data: BoardState) {
    this.observers.forEach(obs => obs.update(data));
  }
}

// Slide thumbnails observe slide changes
class SlideThumbnail implements Observer {
  update(data: BoardState) {
    // Re-render thumbnail when slide changes
  }
}
```

### D. Composite Pattern (Board Elements)
```typescript
// Treat individual objects and groups uniformly
interface BoardElement {
  render(): void;
  move(x: number, y: number): void;
  serialize(): object;
}

class Shape implements BoardElement {
  // Single element implementation
}

class Group implements BoardElement {
  private elements: BoardElement[] = [];
  
  add(element: BoardElement) {
    this.elements.push(element);
  }
  
  render() {
    this.elements.forEach(el => el.render());
  }
  
  move(x: number, y: number) {
    this.elements.forEach(el => el.move(x, y));
  }
}
```

### E. Memento Pattern (Save/Load States)
```typescript
// Capture and restore board state
class BoardMemento {
  private state: BoardState;
  
  constructor(state: BoardState) {
    this.state = state;
  }
  
  getState(): BoardState {
    return this.state;
  }
}

class BoardCaretaker {
  private mementos: BoardMemento[] = [];
  
  save(state: BoardState) {
    this.mementos.push(new BoardMemento(state));
  }
  
  restore(index: number): BoardState {
    return this.mementos[index].getState();
  }
}
```

---

## 4. Data Structures & Algorithms

### A. Slide Management
```typescript
// Doubly Linked List for efficient slide reordering
class SlideNode {
  slide: Slide;
  prev: SlideNode | null;
  next: SlideNode | null;
}

class SlideList {
  private head: SlideNode | null;
  private tail: SlideNode | null;
  private size: number;
  
  // O(1) insertion at position
  insertAt(index: number, slide: Slide): void
  
  // O(1) removal at position
  removeAt(index: number): Slide
  
  // O(n) traversal for rendering
  toArray(): Slide[]
}
```

### B. Spatial Indexing for Canvas Objects
```typescript
// QuadTree for efficient hit detection on large boards
class QuadTree {
  private boundary: Rectangle;
  private capacity: number;
  private objects: CanvasObject[];
  private divided: boolean;
  private northwest?: QuadTree;
  private northeast?: QuadTree;
  private southwest?: QuadTree;
  private southeast?: QuadTree;
  
  // O(log n) average case for point query
  query(point: Point): CanvasObject[]
  
  // O(log n) for insertion
  insert(object: CanvasObject): boolean
}
```

### C. Undo/Redo Stack
```typescript
// Two-stack implementation for O(1) undo/redo
class UndoRedoManager<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];
  private maxSize: number;
  
  push(state: T): void {
    this.undoStack.push(state);
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift(); // Limit memory usage
    }
    this.redoStack = []; // Clear redo on new action
  }
  
  undo(): T | null {
    if (this.undoStack.length === 0) return null;
    const state = this.undoStack.pop();
    if (state) this.redoStack.push(state);
    return this.undoStack[this.undoStack.length - 1] || null;
  }
  
  redo(): T | null {
    if (this.redoStack.length === 0) return null;
    const state = this.redoStack.pop();
    if (state) this.undoStack.push(state);
    return state;
  }
}
```

### D. Event Debouncing for Auto-save
```typescript
// Prevent excessive saves during rapid changes
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage: const autoSave = debounce(saveBoard, 1000);
```

### E. Delta Compression for Network Sync
```typescript
// Only transmit changes, not full state
interface Delta {
  operation: 'add' | 'remove' | 'update';
  objectId: string;
  changes?: Partial<CanvasObject>;
  timestamp: number;
}

class DeltaCompressor {
  // Compare current and previous state
  generateDelta(oldState: BoardState, newState: BoardState): Delta[] {
    // Implement diff algorithm
  }
  
  // Apply delta to reconstruct state
  applyDelta(state: BoardState, delta: Delta[]): BoardState {
    // Implement patch application
  }
}
```

---

## 5. Key Implementation Considerations

### Performance Optimization
1. **Canvas Layering**: Separate static and dynamic layers
   - Background layer (rarely updates)
   - Object layer (frequent updates)
   - Selection layer (real-time feedback)

2. **Virtual Rendering**: Only render visible portion of infinite canvas
   ```typescript
   function getVisibleObjects(viewport: Viewport, quadTree: QuadTree): CanvasObject[] {
     return quadTree.query(viewport.bounds);
   }
   ```

3. **RequestAnimationFrame**: Smooth 60fps rendering
   ```typescript
   function renderLoop() {
     if (needsRender) {
       canvas.renderAll();
       needsRender = false;
     }
     requestAnimationFrame(renderLoop);
   }
   ```

### Data Persistence
1. **Local Storage**: IndexedDB for large board data
2. **Export Formats**: 
   - JSON (full fidelity)
   - PNG (raster export)
   - PDF (print-ready)
3. **Version Control**: Maintain board history with timestamps

### Collaboration (Future)
1. **Operational Transformation (OT)** or **CRDTs** for conflict resolution
2. **WebSocket** for real-time sync
3. **Presence indicators** for multi-user awareness

---

## 6. Development Phases

### Phase 1: Core Canvas (MVP)
- [ ] Basic canvas setup with Fabric.js/Konva
- [ ] Pen, eraser, and shape tools
- [ ] Single board implementation
- [ ] Local storage persistence

### Phase 2: Slide System
- [ ] Horizontal slide bar UI
- [ ] Slide creation/deletion
- [ ] Slide navigation
- [ ] Thumbnail generation

### Phase 3: Advanced Features
- [ ] Undo/redo system
- [ ] Text tool and sticky notes
- [ ] Image upload
- [ ] Export functionality

### Phase 4: Polish & Optimization
- [ ] Performance optimization
- [ ] Touch gesture support
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

### Phase 5: Collaboration (Optional)
- [ ] WebSocket backend
- [ ] Real-time sync
- [ ] User presence
- [ ] Conflict resolution

---

## 7. Recommended Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| Canvas | Fabric.js | Rich API, object model, serialization |
| State | Zustand | Minimal boilerplate, TypeScript-first |
| UI Components | Radix UI | Accessible, unstyled primitives |
| Icons | Lucide React | Clean, consistent icon set |
| Testing | Vitest + React Testing Library | Fast, modern testing stack |
| E2E Testing | Playwright | Reliable cross-browser testing |

---

This architecture provides a solid foundation following software engineering best practices while maintaining flexibility for future enhancements. The design patterns chosen address common challenges in collaborative whiteboard applications, and the data structures are optimized for the specific operations your app will perform most frequently.
