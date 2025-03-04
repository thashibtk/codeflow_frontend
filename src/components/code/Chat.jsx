import React from "react";
import { InputGroup, FormControl, Button } from "react-bootstrap";
import { FaComments, FaPaperPlane } from "react-icons/fa";

const Chat = () => {
  return (
    <div className="chat-container">
      <div className="panel-header">
        <h6 className="mb-0">
          <FaComments className="me-2" /> Chat
        </h6>
      </div>

      {/* Messages Section */}
      <div className="chat-messages">
        <div className="chat-message">
          <div className="message-avatar">A</div>
          <div className="message-content">
            <div className="message-sender">Alice</div>
            <div className="message-text">Hey team! I just pushed the new feature.</div>
          </div>
        </div>
      </div>

      {/* Input Section - Sticks to Bottom */}
      <div className="chat-input">
        <InputGroup>
          <FormControl className="chat-input-field" placeholder="Type a message..." />
          <Button variant="primary">
            <FaPaperPlane />
          </Button>
        </InputGroup>
      </div>
    </div>
  );
};

export default Chat;
