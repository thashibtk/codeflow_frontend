import React, { useState, useEffect, useRef, useCallback } from "react";
import { InputGroup, FormControl, Button, Alert } from "react-bootstrap";
import { FaComments, FaPaperPlane, FaSync } from "react-icons/fa";

const Chat = ({ projectId, user, selectedFile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pendingFileUpdateRef = useRef(null);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Safe send function that checks connection state
  const safeSend = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const connectWebSocket = useCallback(() => {
    // Close existing connection if it exists
    if (socketRef.current) {
      // Don't continue with connection if already connected or connecting
      if (socketRef.current.readyState === WebSocket.OPEN || 
          socketRef.current.readyState === WebSocket.CONNECTING) {
        return;
      }
      
      try {
        socketRef.current.close(1000, "Intentional disconnect");
      } catch (error) {
        console.warn("Error closing existing WebSocket:", error);
      }
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!projectId || !user) {
      setConnectionError("Project ID or user information missing");
      return;
    }

    try {
      const wsUrl = `ws://127.0.0.1:8000/ws/collaborators/${projectId}/`;
      console.log("Attempting to connect to:", wsUrl);
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        setConnectionError(null);
        
        // Send identify message to register the user
        const identifyData = {
          type: "identify",
          sender: user.full_name || user.username || user.email || String(user.id),
          file_id: selectedFile ? selectedFile.id : null
        };
        safeSend(identifyData);
        
        // Send any pending file update
        if (pendingFileUpdateRef.current) {
          safeSend(pendingFileUpdateRef.current);
          pendingFileUpdateRef.current = null;
        }
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket message received:", data);
        
        // Handle different message types
        if (data.type === "chat") {
          setMessages((prevMessages) => [...prevMessages, data]);
        } else if (data.type === "collaborators") {
          // Handle collaborator updates if needed
          console.log("Collaborators updated:", data.users);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setIsConnected(false);
        setConnectionError("Failed to connect to chat server");
      };

      socketRef.current.onclose = (event) => {
        console.warn("⚠️ WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt to reconnect if the closure wasn't intentional
        if (event.code !== 1000) {
          // Use exponential backoff for reconnection
          const backoffTime = Math.min(5000 * Math.pow(2, Math.floor(Math.random() * 3)), 30000);
          console.log(`Reconnecting in ${backoffTime/1000} seconds...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, backoffTime);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnectionError("Failed to create WebSocket connection");
    }
  }, [projectId, user, selectedFile, safeSend]);

  // Connect WebSocket when component mounts or when project/user changes
  useEffect(() => {
    connectWebSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        // Use code 1000 to indicate normal closure
        try {
          socketRef.current.close(1000, "Component unmounted");
        } catch (error) {
          console.warn("Error closing WebSocket during cleanup:", error);
        }
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Update the server when selectedFile changes
  useEffect(() => {
    if (!selectedFile) return;
    
    const fileUpdateData = {
      type: "identify",
      sender: user?.full_name || user?.username || user?.email || String(user?.id) || "Anonymous",
      file_id: selectedFile.id
    };
    
    // If connected, send immediately; otherwise, store for when connection is established
    if (isConnected) {
      if (!safeSend(fileUpdateData)) {
        pendingFileUpdateRef.current = fileUpdateData;
      }
    } else {
      pendingFileUpdateRef.current = fileUpdateData;
    }
  }, [isConnected, selectedFile, user, safeSend]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    // Check if socket is connected
    if (!isConnected || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError("Chat connection lost. Reconnecting...");
      connectWebSocket();

      // Save the message to be sent after reconnection
      const pendingMessage = newMessage;
      setNewMessage("");

      // Add message to local state with "pending" status
      setMessages((prev) => [
        ...prev,
        {
          type: "chat",
          message: pendingMessage,
          sender: user?.full_name || user?.username || user?.email || String(user?.id) || "Anonymous",
          pending: true,
        },
      ]);
      
      return;
    }

    const messageData = {
      type: "chat",
      message: newMessage,
      sender: user?.full_name || user?.username || user?.email || String(user?.id) || "Anonymous",
    };

    try {
      const sent = safeSend(messageData);
      if (sent) {
        setNewMessage(""); // Clear input field
      } else {
        // Handle failed send
        setConnectionError("Failed to send message. Reconnecting...");
        connectWebSocket();
        
        // Add message to local state with "pending" status
        setMessages((prev) => [
          ...prev,
          {
            ...messageData, 
            pending: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setConnectionError("Failed to send message. Reconnecting...");
      connectWebSocket();
    }
  };

  const handleRetryConnection = () => {
    setConnectionError("Reconnecting...");
    connectWebSocket();
  };

  return (
    <div className="chat-container">
      <div className="panel-header">
        <h6 className="mb-0">
          <FaComments className="me-2" /> Chat {isConnected ? "🟢" : "🔴"}
        </h6>
        {!isConnected && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleRetryConnection}
            title="Retry connection"
          >
            <FaSync />
          </Button>
        )}
      </div>

      {connectionError && (
        <Alert variant="warning" dismissible onClose={() => setConnectionError(null)}>
          {connectionError}
        </Alert>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="text-center text-muted p-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.sender === (user?.full_name || user?.username || user?.email || String(user?.id)) 
                  ? "own-message" 
                  : ""
              } ${msg.pending ? "pending-message" : ""}`}
            >
              <div className="message-avatar">
                {(msg.sender?.charAt(0) || "?").toUpperCase()}
              </div>
              <div className="message-content">
                <div className="message-sender">
                  {msg.sender} {msg.pending && "(sending...)"}
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <InputGroup>
          <FormControl
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={!isConnected}
          />
          <Button
            variant="primary"
            onClick={sendMessage}
            disabled={!isConnected || newMessage.trim() === ""}
          >
            <FaPaperPlane />
          </Button>
        </InputGroup>
      </div>
    </div>
  );
};

export default Chat;