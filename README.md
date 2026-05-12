# Jambord 🎨

A high-performance, local-first collaborative whiteboard application inspired by Google Jamboard. Built with React, tldraw, Yjs for CRDT-based synchronization, and a Go backend for real-time WebSocket communication.

## ✨ Features

- **Real-time Collaboration**: Multiple users can draw and edit simultaneously with conflict-free resolution using Yjs CRDTs.
- **Multi-Slide Support**: Navigate between multiple frames/slides with synchronized state across all clients.
- **Jamboard Aesthetic**: 
  - 20px dot grid background
  - Custom color palette (Blue, Red, Green, Yellow)
  - Sticky Note tool with square aspect ratio and light yellow background
- **Glassmorphism UI**: Modern floating toolbar with backdrop blur effects
- **Local-First Architecture**: Works offline with seamless sync when reconnected

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript for type-safe component development
- **tldraw SDK** for powerful canvas operations and drawing tools
- **Yjs** for CRDT-based state synchronization
- **y-websocket** provider for real-time collaboration
- **Tailwind CSS** for utility-first styling with glassmorphism effects
- **Zustand** for lightweight state management
- **Vite** for fast build tooling and hot module replacement

### Backend
- **Go (Golang)** for high-performance concurrent server
- **gorilla/websocket** for efficient WebSocket handling
- **Clean Architecture** pattern for maintainable code structure

## 🏗️ Architecture & Design Principles

### Design Patterns Implemented

#### 1. **Observer Pattern**
- Yjs documents automatically notify UI components of state changes
- Real-time updates propagate through the component tree without manual polling
- Decouples data layer from presentation layer

#### 2. **State Management Pattern**
- Centralized Zustand store manages active tool selection and UI state
- Separates business logic from React components
- Predictable state transitions with explicit actions

#### 3. **Clean Architecture (Backend)**
- **Handlers Layer**: WebSocket connection management
- **Hub/Manager Layer**: Room-based client grouping and message routing
- **Service Layer**: Business logic for message processing
- Ensures separation of concerns and testability

#### 4. **CRDT (Conflict-free Replicated Data Types)**
- Yjs provides automatic conflict resolution for concurrent edits
- No locking mechanisms required
- Guarantees eventual consistency across all clients

### Data Structures & Algorithms

#### 1. **Y.Map for Slide Storage**
```typescript
// Key: Slide ID (string), Value: Drawing data (Y.XmlFragment)
const slides: Y.Map<Y.XmlFragment> = new Y.Map();
```
- O(1) average time complexity for slide lookup
- Efficient delta updates for partial changes
- Automatic merging of concurrent modifications

#### 2. **Y.Array for Slide Order**
```typescript
// Maintains ordered list of slide IDs
const slideOrder: Y.Array<string> = new Y.Array();
```
- Preserves insertion order while supporting concurrent reordering
- Efficient splice operations for adding/removing slides

#### 3. **Binary Protocol Optimization**
- Yjs binary protocol minimizes bandwidth usage
- Only deltas (changes) are transmitted, not full state
- O(k) where k is the size of change, not total document size

#### 4. **Concurrency Model (Go)**
- Goroutines handle each WebSocket connection independently
- Channels ensure thread-safe message broadcasting
- Hub pattern prevents race conditions in room management
- O(n) broadcast to n clients in a room with proper backpressure handling

### Performance Optimizations

- **Local-First Rendering**: Immediate UI updates without waiting for server acknowledgment
- **Debounced Persistence**: Batch writes to prevent excessive database operations
- **Efficient Re-rendering**: React.memo and useMemo prevent unnecessary component updates
- **Binary Compression**: Yjs uses compact binary format for network transmission

## 📁 Project Structure

```
/workspace
├── frontend/                 # React + TypeScript application
│   ├── src/
│   │   ├── components/       # UI components (FrameNavigator, FloatingToolbar)
│   │   ├── hooks/            # Custom React hooks for Yjs integration
│   │   ├── store/            # Zustand state management
│   │   ├── utils/            # Helper functions and constants
│   │   └── App.tsx           # Main application component
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── backend/                  # Go server application
│   ├── cmd/
│   │   └── server/           # Application entry point
│   ├── internal/
│   │   ├── hub/              # Room management and client tracking
│   │   ├── handler/          # WebSocket handlers
│   │   └── service/          # Business logic
│   └── go.mod                # Go module definition
├── ARCHITECTURE.md           # Detailed architecture documentation
├── IMPLEMENTATION_GUIDE.md   # Step-by-step implementation guide
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm/yarn
- **Go** v1.21+
- Git for version control

### Installation & Running

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd workspace
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173` (or next available port).

#### 3. Setup Backend
```bash
cd backend
go mod tidy
go run cmd/server/main.go
```
The backend WebSocket server will start on `ws://localhost:8080`.

#### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`. Create or join a room by appending a room ID to the URL:
```
http://localhost:5173?room=test-room
```

Open multiple browser windows/tabs with the same room ID to test real-time collaboration.

### Development Mode

- **Frontend Hot Reload**: Changes to React components automatically refresh the browser
- **Backend Air**: Install `air` for Go hot reloading:
  ```bash
  go install github.com/cosmtrek/air@latest
  cd backend && air
  ```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
go test ./...
```

### Manual Testing Checklist
- [ ] Draw on canvas and verify real-time sync across multiple clients
- [ ] Switch between slides using Next/Previous buttons
- [ ] Create sticky notes with correct aspect ratio and color
- [ ] Test offline mode (disconnect network, make changes, reconnect)
- [ ] Verify color palette matches Jamboard colors
- [ ] Check glassmorphism effect on toolbar

## 🎨 Customization

### Adding New Colors
Edit the color palette in `frontend/src/utils/constants.ts`:
```typescript
export const JAMBOARD_COLORS = {
  blue: '#1a73e8',
  red: '#d93025',
  green: '#188038',
  yellow: '#f9ab00',
  // Add custom colors here
};
```

### Modifying Grid Pattern
Adjust the dot grid size in `frontend/src/components/CanvasContent.tsx`:
```css
background-size: 20px 20px; /* Change to desired grid size */
```

## 🔒 Security Considerations

- **Room Isolation**: Clients can only access messages within their assigned room
- **Input Validation**: All WebSocket messages are validated before broadcasting
- **Rate Limiting**: Implement rate limiting in production to prevent abuse
- **CORS Configuration**: Configure appropriate CORS policies for production deployment

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Persistent storage with database integration
- [ ] Export to PDF/PNG formats
- [ ] Advanced shapes and diagramming tools
- [ ] Video/audio chat integration
- [ ] Mobile responsive optimizations
- [ ] Plugin system for extensibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

**Frontend:**
- Use functional components with hooks
- Follow ESLint and Prettier configurations
- Write TypeScript interfaces for all props and state
- Keep components small and focused on single responsibility

**Backend:**
- Follow Go best practices and effective Go guidelines
- Write meaningful comments for exported functions
- Use structured logging
- Handle errors explicitly with proper error messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [tldraw](https://github.com/tldraw/tldraw) for the excellent canvas library
- [Yjs](https://github.com/yjs/yjs) for CRDT implementation
- [Google Jamboard](https://jamboard.google.com/) for inspiration
- The open-source community for amazing tools and libraries

---

**Built with ❤️ using React, Go, and Yjs**
