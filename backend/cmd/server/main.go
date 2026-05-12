package main

import (
	"log"
	"net/http"
	"os"

	"server/internal/hub"
	"server/internal/websocket"
)

func main() {
	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create hub and start its event loop in a goroutine
	h := hub.NewHub()
	go h.Run()

	// Create WebSocket handler
	wsHandler := websocket.NewHandler(h)

	// Set up routes
	http.HandleFunc("/ws", wsHandler.ServeHTTP)

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start server
	log.Printf("Starting Yjs sync server on port %s", port)
	log.Printf("WebSocket endpoint: ws://localhost:%s/ws?room=<roomID>", port)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
