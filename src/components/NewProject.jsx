import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const NewProjectModal = ({ show, handleClose, authToken }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleCreateProject = async () => {
    const authToken = localStorage.getItem("accessToken"); // Retrieve token
  
    if (!authToken) {
      console.error("No token found. You must be logged in.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/projects/",
        { name: projectName, description: projectDescription },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      console.log("Project created:", response.data);
      handleClose();
    } catch (error) {
      console.error("Error creating project:", error.response?.data);
    }
  };
  
  

  const handleJoinProject = async () => {
    setError(null);
    setSuccessMessage(null);
  
    const token = localStorage.getItem("accessToken"); // Retrieve token
  
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/projects/join/",
        { project_code: projectCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSuccessMessage("Joined project successfully!");
      setProjectCode("");
      handleClose();
  
      // Show an alert and refresh the page
      setTimeout(() => {
        alert("Joined project successfully!");
        window.location.reload();
      }, 500); // Delay to allow modal to close before refreshing
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to join project.");
    }
  };
  
  

  const darkThemeStyles = {
    modal: { backgroundColor: "#212529", color: "#f8f9fa", borderRadius: "8px" },
    header: { backgroundColor: "#343a40", borderBottom: "1px solid #495057", color: "#f8f9fa" },
    title: { color: "#f8f9fa", fontWeight: "600" },
    body: { backgroundColor: "#212529", padding: "24px" },
    formLabel: { color: "#e1e7f0", fontWeight: "500" },
    formControl: { backgroundColor: "#6f7a8c", color: "#e9ecef", border: "1px solid #495057" },
    button: { fontWeight: "500", marginTop: "8px", marginBottom: "8px" },
    divider: { backgroundColor: "#495057", height: "1px", margin: "24px 0" },
    sectionTitle: { color: "#e9ecef", marginBottom: "16px", fontSize: "1.1rem" },
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="border-0">
      <div style={darkThemeStyles.modal}>
        <Modal.Header closeButton style={darkThemeStyles.header}>
          <Modal.Title style={darkThemeStyles.title}>New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body style={darkThemeStyles.body}>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          {/* Create Project Section */}
          <h5 style={darkThemeStyles.sectionTitle}>Create a New Project</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={darkThemeStyles.formLabel}>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={darkThemeStyles.formControl}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={darkThemeStyles.formLabel}>Project Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                style={darkThemeStyles.formControl}
              />
            </Form.Group>
            <Button variant="primary" className="w-100" onClick={handleCreateProject} style={darkThemeStyles.button}>
              Create Project
            </Button>
          </Form>

          <div style={darkThemeStyles.divider}></div>

          {/* Join Project Section */}
          <h5 style={darkThemeStyles.sectionTitle}>Join an Existing Project</h5>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={darkThemeStyles.formLabel}>Project Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project code"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                style={darkThemeStyles.formControl}
              />
            </Form.Group>
            <Button variant="success" className="w-100" onClick={handleJoinProject} style={darkThemeStyles.button}>
              Join Project
            </Button>
          </Form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default NewProjectModal;
