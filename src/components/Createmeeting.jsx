import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const CreateMeetingModal = ({ show, handleClose }) => {
  const [meetingDetails, setMeetingDetails] = useState({ 
    name: "", 
    description: "", 
    time: "" 
  });

  const handleCreate = () => {
    console.log("Creating meeting:", meetingDetails);
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
          <Modal.Title style={darkThemeStyles.title}>Create Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark border-secondary">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Meeting Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter meeting name"
                className="bg-secondary text-light"
                value={meetingDetails.name}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter description"
                className="bg-secondary text-light"
                value={meetingDetails.description}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Meeting Time</Form.Label>
              <Form.Control
                type="datetime-local"
                className="bg-secondary text-light"
                value={meetingDetails.time}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, time: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleCreate} className="w-100">
              Create Meeting
            </Button>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default CreateMeetingModal;