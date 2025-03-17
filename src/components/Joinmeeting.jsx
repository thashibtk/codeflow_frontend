import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const JoinMeetingModal = ({ show, handleClose }) => {
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!meetingCode.trim()) {
      setError("Meeting code is required.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You need to log in first.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "http://127.0.0.1:8000/api/meetings/join/",
        { meeting_code: meetingCode },
        config
      );

      console.log("Joined meeting:", response.data);
      alert("Successfully joined the meeting!");
      setTimeout(() => {
        handleClose();
        window.location.reload(); // ✅ Reloads the whole page
      }, 500);

      setError("");
      handleClose();
    } catch (error) {
      console.error("Error joining meeting:", error);
      setError("Invalid meeting code or an error occurred.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>Join Meeting</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Meeting Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter meeting code"
              className="bg-secondary text-light"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
            />
          </Form.Group>
          <Button variant="success" onClick={handleJoin} className="w-100">
            Join Meeting
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default JoinMeetingModal;
