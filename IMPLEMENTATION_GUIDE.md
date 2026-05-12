# Jamboard Clone - Implementation Guide

## Project Overview
A high-performance, local-first Google Jamboard clone with real-time collaboration using CRDT-based synchronization.

## Tech Stack
- **Frontend**: React 18+, TypeScript, tldraw SDK, Yjs, Tailwind CSS, Zustand
- **Backend**: Go (Golang) with gorilla/websocket
- **Sync Engine**: Yjs CRDT with binary protocol over WebSockets

## Architecture

### Design Patterns Used

#### 1. Observer Pattern
- **Frontend**: Yjs `observe()` methods notify UI components of state changes
- **Backend**: Hub broadcasts messages to all subscribed clients in a room
- **Implementation**: See `frontend/src/store/useJamboardStore.ts` and `backend/internal/hub/hub.go`

#### 2. State Management Pattern
- Centralized store using Zustand for reactive state
- Separation of local UI state (active tool) and shared state (slide index)

#### 3. Publisher-Subscriber Pattern
- Yjs provider publishes changes to all connected clients
- Backend hub subscribes clients to rooms and publishes binary messages

### Data Structures

#### Yjs Types
- **Y.Array**: Stores slides list for O(1) indexing and efficient reordering
- **Y.Map**: Stores appState (currentSlideIndex) and individual slide content
- **Key-Value Mapping**: `slide:${slideId}` → Slide content Map

#### Backend Concurrency
- **Channels**: Thread-safe communication between goroutines
- **Mutex (RWMutex)**: Protects shared client map with read-write locking
- **Select Statement**: Non-blocking message handling

## Project Structure

```
jamboard-clone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FrameNavigator.tsx    # Top header with slide controls
│   │   │   ├── FloatingToolbar.tsx   # Left sidebar with tools
│   │   │   └── CanvasContent.tsx     # tldraw canvas wrapper
│   │   ├── hooks/
│   │   │   └── useYjsSync.ts         # Yjs initialization hook
│   │   ├── store/
│   │   │   └── useJamboardStore.ts   # Zustand store with Yjs integration
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # Main application component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles with dot grid
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── backend/
    ├── cmd/
    │   └── server/
    │       └── main.go               # Server entry point
    ├── internal/
    │   ├── hub/
    │   │   └── hub.go                # Client management & broadcasting
    │   └── websocket/
    │       └── handler.go            # WebSocket connection handler
    └── go.mod
```

## Key Features

### Frontend

#### Layout
- **Fixed Top Header** (60px): Frame navigator showing "Slide X of Y"
- **Left Floating Toolbar**: Glassmorphism effect with backdrop-blur
- **Main Canvas**: Full-screen tldraw editor with 20px dot grid

#### Multi-Slide Logic
1. Clicking Next/Previous updates `currentSlideIndex` in Y.Map
2. Yjs syncs change to all connected clients
3. All users automatically switch to the same frame
4. Slide data stored in separate Y.Maps per slide ID

#### Jamboard Aesthetic
- Custom color palette: Blue (#1a73e8), Red (#d93025), Green (#188038), Yellow (#f9ab00)
- Sticky Note tool: Square aspect ratio, light yellow background (#ffff88)
- Dot grid background: 20px spacing via CSS pattern

### Backend

#### WebSocket Handler
- Uses `gorilla/websocket` for connection management
- Extracts room ID from query parameters
- Handles binary messages only (Yjs protocol)

#### Room Management
- Hub struct maintains map of rooms → clients
- Thread-safe operations with RWMutex
- Automatic cleanup of empty rooms

#### Binary Broadcasting
- Server treats messages as opaque binary data
- No JSON parsing - direct pass-through of Yjs updates
- Non-blocking sends with buffer overflow protection

#### Concurrency Model
```go
// Main event loop
for {
    select {
    case client := <-h.register:
        h.registerClient(client)
    case client := <-h.unregister:
        h.unregisterClient(client)
    case message := <-h.broadcast:
        h.broadcastMessage(message)
    }
}
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### Access
- Frontend: http://localhost:3000
- Backend WebSocket: ws://localhost:8080/ws?room=<roomID>

## Sync Flow

1. **Client Connects**: Opens WebSocket to `/ws?room=room-1`
2. **Yjs Initialization**: Creates Y.Doc and WebsocketProvider
3. **User Draws**: tldraw generates operations
4. **Local Update**: Yjs applies operation locally (instant)
5. **Sync**: Provider sends binary update to server
6. **Broadcast**: Server forwards to all other clients in room
7. **Remote Update**: Other clients receive and apply operation
8. **UI Update**: Observer pattern triggers React re-render

## Performance Optimizations

- **CRDT Conflict Resolution**: No locking needed for concurrent edits
- **Binary Protocol**: Minimal bandwidth usage
- **Non-blocking I/O**: Go routines handle thousands of connections
- **Selective Re-renders**: Zustand ensures only affected components update
- **Debounced Persistence**: Local storage saves without blocking sync

## Next Steps

1. Implement custom sticky note shape in tldraw
2. Add slide thumbnail previews in header
3. Implement drag-and-drop slide reordering
4. Add user presence indicators (cursors, avatars)
5. Deploy backend with TLS for production
6. Add authentication and room permissions
