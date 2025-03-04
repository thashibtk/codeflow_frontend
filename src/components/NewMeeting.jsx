import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Tab, Tabs } from "react-bootstrap";

const CreateMeetingModal = ({ show, handleClose, projectId, authToken }) => {
  const [meetingDetails, setMeetingDetails] = useState({
    name: "",
    description: "",
    time: "",
  });
  const [meetingCode, setMeetingCode] = useState("");
  const [loading, setLoading] = useState(false);

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
    },
    divider: {
      backgroundColor: "#495057",
      height: "1px",
      margin: "24px 0"
    },
    sectionTitle: {
      color: "#e9ecef",
      marginBottom: "16px",
      fontSize: "1.1rem"
    }
  }

  // ✅ Handle Creating a Meeting
  const handleCreate = async () => {
    if (!meetingDetails.name || !meetingDetails.time) {
      alert("Meeting name and time are required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/meetings/${projectId}/create-meeting/`, // ✅ Backend API endpoint
        {
          name: meetingDetails.name,
          scheduled_time: meetingDetails.time, // Match backend field
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }, // ✅ Send token
        }
      );
      console.log("Meeting created:", response.data);
      handleClose();
    } catch (error) {
      console.error("Error creating meeting:", error.response?.data || error);
      alert("Failed to create meeting");
    }
    setLoading(false);
  };

  // ✅ Handle Joining a Meeting
  const handleJoin = async () => {
    if (!meetingCode) {
      alert("Meeting code is required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/meetings/join/`,
        { meeting_code: meetingCode },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("Joined meeting:", response.data);
      handleClose();
    } catch (error) {
      console.error("Error joining meeting:", error.response?.data || error);
      alert("Failed to join meeting");
    }
    setLoading(false);

  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border-0">
      <div style={darkThemeStyles.modal}>
        <Modal.Header closeButton style={darkThemeStyles.header}>
          <Modal.Title style={darkThemeStyles.title}>New Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark border-secondary">
        <Tabs defaultActiveKey="create" className="mb-3" variant="pills">
          {/* Create Meeting Tab */}
          <Tab eventKey="create" title="Create Meeting">
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
          </Tab>
          
          {/* Join Meeting Tab */}
          <Tab eventKey="join" title="Join Meeting">
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
          </Tab>
        </Tabs>
      </Modal.Body>
      </div>
    </Modal>
  );
};

export default CreateMeetingModal;
