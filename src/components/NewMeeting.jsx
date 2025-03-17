import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import "./NewMeeting.css"; 

const CreateMeetingModal = ({ show, handleClose, projectId }) => {
  const [meetingDetails, setMeetingDetails] = useState({
    name: "",
    description: "",
    time: "",
  });
  
  const [validated, setValidated] = useState(false);
  
  const getValidToken = async () => {
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
  
    if (!token && refreshToken) {
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh: refreshToken,
        });
        localStorage.setItem("accessToken", response.data.access);
        token = response.data.access;
      } catch (error) {
        console.error("❌ Token refresh failed. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
    return token;
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    // Check if form is valid
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    
    await handleCreate();
  };
  
  const handleCreate = async () => {
    if (!projectId) {
      alert("Project ID is missing! Please open a project before scheduling a meeting.");
      return;
    }
  
    const token = await getValidToken();
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/meetings/${projectId}/create-meeting/`,
        {
          name: meetingDetails.name,
          description: meetingDetails.description,
          scheduled_time: meetingDetails.time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("✅ Meeting created:", response.data);
      alert("Meeting created successfully!");
      handleClose();
    } catch (error) {
      console.error("❌ Error creating meeting:", error.response?.data || error.message);
    }
  };

  // ✅ Apply dark theme styles
  const darkThemeStyles = {
    modal: {
      backgroundColor: "#212529",
      color: "#f8f9fa",
      borderRadius: "8px",
    },
    header: {
      backgroundColor: "#343a40",
      borderBottom: "1px solid #495057",
      color: "#f8f9fa",
      paddingTop: "15px",
      paddingBottom: "15px",
    },
    title: {
      color: "#f8f9fa",
      fontWeight: "600",
    },
    body: {
      backgroundColor: "#212529",
      padding: "24px",
    },
    formLabel: {
      color: "#e9ecef",
      fontWeight: "500",
    },
    formControl: {
      backgroundColor: "#2b3035",
      color: "#e9ecef",
      border: "1px solid #495057",
    },
    button: {
      fontWeight: "500",
      marginTop: "8px",
      marginBottom: "8px",
    },
    invalidFeedback: {
      color: "#dc3545",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border-0">
      <div style={darkThemeStyles.modal}>
        <Modal.Header closeButton style={darkThemeStyles.header}>
          <Modal.Title style={darkThemeStyles.title}>Create Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark border-secondary">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={darkThemeStyles.formLabel}>Meeting Name*</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter meeting name"
                style={darkThemeStyles.formControl}
                value={meetingDetails.name}
                onChange={(e) =>
                  setMeetingDetails({ ...meetingDetails, name: e.target.value })
                }
                className="custom-placeholder"
                required
              />
              <Form.Control.Feedback type="invalid" style={darkThemeStyles.invalidFeedback}>
                Meeting name is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={darkThemeStyles.formLabel}>Description*</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter description"
                style={darkThemeStyles.formControl}
                value={meetingDetails.description}
                onChange={(e) =>
                  setMeetingDetails({ ...meetingDetails, description: e.target.value })
                }
                className="custom-placeholder"
                required
              />
              <Form.Control.Feedback type="invalid" style={darkThemeStyles.invalidFeedback}>
                Description is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={darkThemeStyles.formLabel}>Meeting Time*</Form.Label>
              <Form.Control
                type="datetime-local"
                style={darkThemeStyles.formControl}
                value={meetingDetails.time}
                onChange={(e) =>
                  setMeetingDetails({ ...meetingDetails, time: e.target.value })
                }
                className="custom-placeholder"
                required
              />
              <Form.Control.Feedback type="invalid" style={darkThemeStyles.invalidFeedback}>
                Meeting time is required.
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              style={darkThemeStyles.button}
            >
              Create Meeting
            </Button>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default CreateMeetingModal;