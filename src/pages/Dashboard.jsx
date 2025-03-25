import React, { useEffect, useState } from "react";
import { Card, Row, Col, Container, Button, Alert, Spinner, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedMeetingId, setCopiedMeetingId] = useState(null);
  
  // Meeting deletion state
  const [showDeleteMeetingModal, setShowDeleteMeetingModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [deleteMeetingLoading, setDeleteMeetingLoading] = useState(false);

  // Meeting edit state
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState(null);
  const [editMeetingLoading, setEditMeetingLoading] = useState(false);
  const [editMeetingForm, setEditMeetingForm] = useState({
    name: "",
    scheduled_time: "",
    description: ""
  });

  
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login"); // Redirect to login if no token
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch user details
        const userRes = await axios.get("http://127.0.0.1:8000/api/users/me/", config);
        setUsername(userRes.data.full_name);
        setUserId(userRes.data.id); // Store the user ID for permission checks
        
        // Fetch user projects
        const projectsRes = await axios.get("http://127.0.0.1:8000/api/projects/", config);
        setProjects(projectsRes.data);

        // Fetch user meetings
        const meetingsRes = await axios.get("http://127.0.0.1:8000/api/meetings/", config);
        setMeetings(meetingsRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (error.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("accessToken"); // Clear invalid token
          navigate("/login"); // Redirect to login
        } else {
          setError("Failed to load data. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Format date and time for better display
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Handle ISO format with T and Z (2025-03-17T16:30:00Z)
      if (dateString.includes('T')) {
        // Split the parts - strip off any Z at the end which indicates UTC
        const cleanDateString = dateString.replace('Z', '');
        const [datePart, timePart] = cleanDateString.split('T');
        const [year, month, day] = datePart.split('-');
        let [hours, minutes] = timePart ? timePart.split(':') : [0, 0];
        
        // Convert to 12-hour format with AM/PM for better readability
        let period = "AM";
        if (parseInt(hours) >= 12) {
          period = "PM";
          if (parseInt(hours) > 12) {
            hours = String(parseInt(hours) - 12).padStart(2, '0');
          }
        }
        if (hours === "00") hours = "12";
        
        // Format in a user-friendly way
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        return `${monthNames[parseInt(month)-1]} ${parseInt(day)}, ${year} at ${hours}:${minutes} ${period}`;
      } else {
        // For other formats, just return as is
        return dateString;
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if parsing fails
    }
  };

  // Format date-time for input field
  const formatDateTimeForInput = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().slice(0, 16);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation(); // Prevent navigating to project details
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Check if user is the creator of the project
  const isProjectCreator = (project) => {
    return project.created_by === userId;
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    setDeleteLoading(true);
    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/projects/${projectToDelete.id}/`, config);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Check if user is the creator of the meeting
  const isCreator = (meeting) => {
    return meeting.created_by === userId;
  };

  // Handle meeting deletion
  const handleDeleteMeetingClick = (e, meeting) => {
    e.stopPropagation(); // Prevent navigating to meeting details
    setMeetingToDelete(meeting);
    setShowDeleteMeetingModal(true);
  };

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    
    setDeleteMeetingLoading(true);
    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/meetings/${meetingToDelete.id}/`, config);
      setMeetings(meetings.filter(m => m.id !== meetingToDelete.id));
      setShowDeleteMeetingModal(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error("Error deleting meeting:", error);
      setError("Failed to delete meeting. Please try again.");
    } finally {
      setDeleteMeetingLoading(false);
    }
  };

  // Handle edit meeting click
  const handleEditMeeting = (e, meeting) => {
    e.stopPropagation(); // Prevent default action
    setMeetingToEdit(meeting);
    setEditMeetingForm({
      name: meeting.name,
      scheduled_time: formatDateTimeForInput(meeting.scheduled_time),
      description: meeting.description || ""
    });
    setShowEditMeetingModal(true);
  };

  // Handle form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditMeetingForm({
      ...editMeetingForm,
      [name]: value
    });
  };

  // Submit edit meeting form
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!meetingToEdit) return;
    
    setEditMeetingLoading(true);
    const token = localStorage.getItem("accessToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/meetings/${meetingToEdit.id}/`, 
        editMeetingForm,
        config
      );
      
      // Update the meetings list with the edited meeting
      setMeetings(meetings.map(m => 
        m.id === meetingToEdit.id ? { ...m, ...response.data } : m
      ));
      
      setShowEditMeetingModal(false);
      setMeetingToEdit(null);
    } catch (error) {
      console.error("Error updating meeting:", error);
      setError("Failed to update meeting. Please try again.");
    } finally {
      setEditMeetingLoading(false);
    }
  };

  const handleJoinMeeting = async (meeting) => {
    const token = localStorage.getItem("accessToken"); // Changed from "token" to "accessToken"
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      navigate("/login");
      return;
    }
    
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/meetings/join/",
        { meeting_code: meeting.meeting_code },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      
      console.log("Successfully joined meeting:", response.data);
      navigate(`/meeting/${meeting.id}`); // Using navigate instead of window.location
    } catch (error) {
      console.error("Error joining meeting:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to join meeting. Please try again.");
    }
  };

  const handleCopyCode = (meetingId, code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedMeetingId(meetingId); // Show "Copied!" tooltip
        setTimeout(() => setCopiedMeetingId(null), 2000); // Hide after 2 seconds
      })
      .catch(err => console.error("Failed to copy:", err));
  };


  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="light" />
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#121212", color: "#e0e0e0", minHeight: "100vh" }}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <h2 className="mb-4 text-light">Welcome, {username}!</h2>
      <h1 className="mb-2 text-light">Dashboard</h1>

      <Row>
        <Col lg={8} className="mb-4">
          <Card bg="dark" text="light" className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Projects</h5>
              <Button variant="outline-light" size="sm">View All</Button>
            </Card.Header>
            <Card.Body>
              <Row>
                {projects.map(project => (
                  <Col md={6} lg={4} key={project.id} className="mb-3">
                    <Card 
                      bg="secondary" 
                      text="light" 
                      className="h-100 shadow-sm"
                      onClick={() => navigate(`/project/${project.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Card.Body>
                        <Card.Title>{project.name}</Card.Title>
                        <Card.Text className="text-light opacity-75">
                          Last active: {project.last_active || "Unknown"}
                        </Card.Text>
                        <Card.Text className="text-light opacity-75 d-flex align-items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                          </svg>
                          {project.members_count} members
                        </Card.Text>
                        {isProjectCreator(project) && (
                          <div className="d-flex justify-content-end">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={(e) => handleDeleteClick(e, project)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card bg="dark" text="light" className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Meetings</h5>
            </Card.Header>
            <Card.Body>
              {meetings.length === 0 ? (
                <p className="text-light opacity-75">No upcoming meetings</p>
              ) : (
                meetings.map(meeting => (
                  <Card bg="secondary" text="light" className="mb-3" key={meeting.id}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Card.Title className="mb-0">{meeting.name}</Card.Title>
                        {isCreator(meeting) && (
                          <div>
                            <Button 
                              variant="outline-light" 
                              size="sm" 
                              className="me-2"
                              onClick={(e) => handleEditMeeting(e, meeting)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={(e) => handleDeleteMeetingClick(e, meeting)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      <Card.Text className="text-light opacity-75">
                        <strong>{meeting.project_name || "Project"}</strong>
                      </Card.Text>
                      <Card.Text className="text-light opacity-75 d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                        </svg>
                        {formatDateTime(meeting.scheduled_time)}
                      </Card.Text>
                      <div className="d-flex align-items-center justify-content-between text-light opacity-75 border rounded border-dark p-2">
                      <Card.Text>
                        <span className="text-light me-2">Meet Code:</span>
                        <span className="fw-bold font-monospace text-white">{meeting.meeting_code}</span>
                      </Card.Text>
                      <div className="position-relative">
                        <button className="btn btn-sm btn-outline-light" onClick={() => handleCopyCode(meeting.id, meeting.meeting_code)}>
                          <i className="bi bi-clipboard me-1"></i> Copy
                        </button>
                        {copiedMeetingId === meeting.id && (
                    <div className="position-absolute top-100 start-50 translate-middle-x mt-2 bg-success text-white py-1 px-2 rounded small">
                      Copied!
                    </div>
                  )}
                      </div>
                    </div>

                      {meeting.description && (
                        <Card.Text className="text-light opacity-75">
                          {meeting.description}
                        </Card.Text>
                      )}
                      <div className="d-flex justify-content-end mt-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleJoinMeeting(meeting)}
                      >
                        Join
                      </Button>

                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Project Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderBottom: "1px solid #444" }}>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderTop: "1px solid #444" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner size="sm" animation="border" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Meeting Confirmation Modal */}
      <Modal show={showDeleteMeetingModal} onHide={() => setShowDeleteMeetingModal(false)} centered backdrop="static">
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderBottom: "1px solid #444" }}>
          <Modal.Title>Confirm Delete Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          Are you sure you want to delete the meeting "{meetingToDelete?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderTop: "1px solid #444" }}>
          <Button variant="secondary" onClick={() => setShowDeleteMeetingModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteMeeting}
            disabled={deleteMeetingLoading}
          >
            {deleteMeetingLoading ? <Spinner size="sm" animation="border" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Meeting Modal */}
      <Modal show={showEditMeetingModal} onHide={() => setShowEditMeetingModal(false)} centered backdrop="static">
        <Modal.Header closeButton style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0", borderBottom: "1px solid #444" }}>
          <Modal.Title>Edit Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#2a2a2a", color: "#e0e0e0" }}>
          <Form onSubmit={handleSubmitEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Meeting Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={editMeetingForm.name} 
                onChange={handleEditFormChange}
                required
                style={{ backgroundColor: "#3a3a3a", color: "#e0e0e0", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date and Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="scheduled_time" 
                value={editMeetingForm.scheduled_time} 
                onChange={handleEditFormChange}
                required
                style={{ backgroundColor: "#3a3a3a", color: "#e0e0e0", border: "1px solid #444" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={editMeetingForm.description} 
                onChange={handleEditFormChange}
                style={{ backgroundColor: "#3a3a3a", color: "#e0e0e0", border: "1px solid #444" }}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowEditMeetingModal(false)} className="me-2">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={editMeetingLoading}
              >
                {editMeetingLoading ? <Spinner size="sm" animation="border" /> : "Save Changes"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Dashboard;