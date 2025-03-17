import React, { useState } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import NewProjectModal from "./NewProject";
import NewMeetingModal from "./NewMeeting";
import JoinMeetingModal from "./Joinmeeting"; 
import LogoutComponent from "./Logout";
import { Link } from "react-router-dom";

const CodeFlowNavbar = ({ refreshDashboard }) => {
  const location = useLocation();
  const projectIdMatch = location.pathname.match(/\/project\/([^\/]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : null;

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showJoinMeetingModal, setShowJoinMeetingModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isProjectPage = location.pathname.startsWith("/project/");

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-3 w-100">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-uppercase text-light">
            <span style={{ color: "#0d6efd" }}>Code</span>Flow
          </Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center">
            <Button 
              variant="outline-light" 
              className="me-3 px-4 rounded-pill" 
              onClick={() => setShowProjectModal(true)}
            >
              + New Project
            </Button>
            {isProjectPage ? (
              <Button 
                variant="primary" 
                className="me-3 px-4 rounded-pill"
                onClick={() => setShowMeetingModal(true)}
              >
                + New Meeting
              </Button>
            ) : (
              <Button 
                variant="success" 
                className="me-3 px-4 rounded-pill"
                onClick={() => setShowJoinMeetingModal(true)}
              >
                🔗 Join Meeting
              </Button>
            )}
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic" className="d-flex align-items-center rounded-pill">
                <FaUserCircle size={22} className="me-2" /> 
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0">
                <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowLogoutModal(true)}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* Modals */}
      <NewProjectModal show={showProjectModal} handleClose={() => setShowProjectModal(false)} />
      {isProjectPage ? (
        <NewMeetingModal 
          show={showMeetingModal} 
          handleClose={() => setShowMeetingModal(false)} 
          projectId={projectId}  
        />
      ) : (
        <JoinMeetingModal 
          show={showJoinMeetingModal} 
          handleClose={() => setShowJoinMeetingModal(false)} 
          refreshDashboard={refreshDashboard} // ✅ Pass refresh function
        />
      )}
      <LogoutComponent showModal={showLogoutModal} handleClose={() => setShowLogoutModal(false)} />
    </>
  );
};

export default CodeFlowNavbar;
