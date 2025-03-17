import React, { useState } from "react";
import { Navbar, Nav, Container, Button, Dropdown } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const AuthNav = () => {
  const location = useLocation(); // ✅ Get current route
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showJoinMeetingModal, setShowJoinMeetingModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  
  const isProjectPage = location.pathname === "/projectedit" || 
                      location.pathname === "/projectdetails" || 
                      location.pathname.startsWith("/project/");
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-3 w-100">
        <Container fluid>
          <Navbar.Brand href="/" className="fw-bold text-uppercase text-light">
            <span style={{ color: "#0d6efd" }}>Code</span>Flow
          </Navbar.Brand>
          
        </Container>
      </Navbar>
    </>
  );
};

export default AuthNav;
