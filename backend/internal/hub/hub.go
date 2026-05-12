package hub

import (
	"sync"
)

// Client represents a connected WebSocket client
type Client struct {
	ID   string
	Hub  *Hub
	Send chan []byte
}

// Hub manages all client connections and rooms
// Implements the Observer Pattern for broadcasting messages
type Hub struct {
	// Registered clients by room
	clients map[string]map[*Client]bool
	
	// Mutex for thread-safe operations
	mu sync.RWMutex
	
	// Channel for registering clients
	register chan *Client
	
	// Channel for unregistering clients
	unregister chan *Client
	
	// Channel for broadcasting messages
	broadcast chan *BroadcastMessage
}

// BroadcastMessage contains the message and target room
type BroadcastMessage struct {
	RoomID  string
	Message []byte
	Sender  *Client
}

// NewHub creates a new Hub instance
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *BroadcastMessage, 256),
	}
}

// Run starts the hub's main event loop
// Uses goroutines and channels for concurrent message handling
func (h *Hub) Run() {
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
}

// registerClient adds a client to a room
func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	
	// For this implementation, we'll use a default room or extract from client
	// In production, you'd extract roomID from the WebSocket connection
	roomID := "default-room"
	
	if _, exists := h.clients[roomID]; !exists {
		h.clients[roomID] = make(map[*Client]bool)
	}
	
	h.clients[roomID][client] = true
}

// unregisterClient removes a client from all rooms
func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	
	for roomID := range h.clients {
		if _, exists := h.clients[roomID][client]; exists {
			delete(h.clients[roomID], client)
			close(client.Send)
			
			// Clean up empty rooms
			if len(h.clients[roomID]) == 0 {
				delete(h.clients, roomID)
			}
		}
	}
}

// broadcastMessage sends a binary message to all clients in a room except the sender
// This is the core of the Observer Pattern - notifying all observers (clients) of changes
func (h *Hub) broadcastMessage(message *BroadcastMessage) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	if clients, exists := h.clients[message.RoomID]; exists {
		for client := range clients {
			if client != message.Sender {
				// Non-blocking send to prevent deadlocks
				select {
				case client.Send <- message.Message:
				default:
					// Client buffer full, disconnect them
					close(client.Send)
					delete(clients, client)
				}
			}
		}
	}
}

// RegisterClient queues a client for registration
func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

// UnregisterClient queues a client for unregistration
func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

// Broadcast queues a message for broadcasting to a room
func (h *Hub) Broadcast(roomID string, message []byte, sender *Client) {
	h.broadcast <- &BroadcastMessage{
		RoomID:  roomID,
		Message: message,
		Sender:  sender,
	}
}

// GetClientCount returns the number of clients in a room (for monitoring)
func (h *Hub) GetClientCount(roomID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	if clients, exists := h.clients[roomID]; exists {
		return len(clients)
	}
	return 0
}
