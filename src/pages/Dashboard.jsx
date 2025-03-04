import React, { useEffect, useState } from "react";
import { Card, Row, Col, Container, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const userRes = await axios.get("http://127.0.0.1:8000/api/users/user/", config);
        setUsername(userRes.data.full_name);
        
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

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#121212", color: "#e0e0e0", minHeight: "100vh" }}>
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
                        <Card.Text className="text-light opacity-75">
                          {project.members_count} members
                        </Card.Text>
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
              <Button variant="outline-light" size="sm">View Calendar</Button>
            </Card.Header>
            <Card.Body>
              {meetings.length === 0 ? (
                <p className="text-light opacity-75">No upcoming meetings</p>
              ) : (
                meetings.map(meeting => (
                  <Card bg="secondary" text="light" className="mb-3" key={meeting.id}>
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <div>
                        <Card.Title className="mb-1">{meeting.name}</Card.Title>
                        <Card.Text className="text-light opacity-75">
                          <strong>{meeting.project_name}</strong>  {new Date(meeting.scheduled_time).toLocaleString()}
                        </Card.Text>
                      </div>
                      <Button variant="outline-light" size="sm">Join</Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>

          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
