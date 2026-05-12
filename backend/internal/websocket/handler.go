package websocket

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"server/internal/hub"
)

// WebSocket configuration
var upgrader = websocket.Upgrader{
	// Allow all origins for development (restrict in production)
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	// Enable binary message handling
	EnableCompression: true,
}

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512 * 1024 // 512 KB
)

// Handler manages WebSocket connections for a room
type Handler struct {
	hub *hub.Hub
}

// NewHandler creates a new WebSocket handler
func NewHandler(h *hub.Hub) *Handler {
	return &Handler{hub: h}
}

// ServeHTTP handles WebSocket upgrade and connection management
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Extract room ID from query parameters
	roomID := r.URL.Query().Get("room")
	if roomID == "" {
		roomID = "default-room"
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// Create client
	client := &hub.Client{
		ID:   generateClientID(),
		Hub:  h.hub,
		Send: make(chan []byte, 256),
	}

	// Register client with hub
	h.hub.RegisterClient(client)

	// Start goroutines for reading and writing
	go h.writePump(client, conn)
	go h.readPump(client, conn, roomID)
}

// readPump reads messages from the WebSocket and broadcasts them
// Handles binary Yjs sync protocol messages without parsing
func (h *Handler) readPump(client *hub.Client, conn *websocket.Conn, roomID string) {
	defer func() {
		h.hub.UnregisterClient(client)
		conn.Close()
	}()

	// Set read limits and deadline
	conn.SetReadLimit(maxMessageSize)
	conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		// Read message type and data
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}

		// Only handle binary messages (Yjs sync protocol)
		if messageType == websocket.BinaryMessage {
			// Broadcast binary message to all clients in room
			// Server does NOT parse the message - it's opaque binary data
			h.hub.Broadcast(roomID, message, client)
		} else if messageType == websocket.TextMessage {
			// Log unexpected text messages (for debugging)
			log.Printf("Received unexpected text message from %s: %s", client.ID, string(message))
		}
	}
}

// writePump writes messages to the WebSocket
func (h *Handler) writePump(client *hub.Client, conn *websocket.Conn) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			// Set write deadline
			conn.SetWriteDeadline(time.Now().Add(writeWait))

			if !ok {
				// Hub closed the channel
				conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// Write binary message (Yjs sync protocol)
			if err := conn.WriteMessage(websocket.BinaryMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}

		case <-ticker.C:
			// Send ping to keep connection alive
			conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("WebSocket ping error: %v", err)
				return
			}
		}
	}
}

// generateClientID creates a unique client identifier
func generateClientID() string {
	// In production, use uuid or similar
	return fmt.Sprintf("client-%d", time.Now().UnixNano())
}
