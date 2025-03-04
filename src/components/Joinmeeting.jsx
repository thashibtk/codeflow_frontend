import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const JoinMeetingModal = ({ show, handleClose }) => {
  const [meetingCode, setMeetingCode] = useState("");

  const handleJoin = () => {
    console.log("Joining meeting with code:", meetingCode);
    handleClose();
  };

  // Dark theme styles
  const darkThemeStyles = {
    modal: {
      backgroundColor: "#212529",
      color: "#f8f9fa",
      borderRadius: "8px"
    },
    header: {
      backgroundColor: "#343a40",
      borderBottom: "1px solid #495057",
      color: "#f8f9fa",
      paddingTop: "15px",
      paddingBottom: "15px"
    },
    title: {
      color: "#f8f9fa",
      fontWeight: "600"
    },
    body: {
      backgroundColor: "#212529",
      padding: "24px"
    },
    formLabel: {
      color: "#e9ecef",
      fontWeight: "500"
    },
    formControl: {
      backgroundColor: "#2b3035",
      color: "#e9ecef",
      border: "1px solid #495057"
    },
    button: {
      fontWeight: "500",
      marginTop: "8px",
      marginBottom: "8px"
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border-0">
      <div style={darkThemeStyles.modal}>
        <Modal.Header closeButton style={darkThemeStyles.header}>
          <Modal.Title style={darkThemeStyles.title}>Join Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark border-secondary">
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
      </div>
    </Modal>
  );
};

export default JoinMeetingModal;