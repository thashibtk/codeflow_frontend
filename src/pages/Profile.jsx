import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Row, Col } from "react-bootstrap";
import { FaHome, FaUser, FaEdit } from "react-icons/fa";
import { useNavigate,useLocation  } from "react-router-dom";
import axios from "axios";

const ProfileViewComponent = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage || "";

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#343a40" }}>
        <div className="spinner-border text-light" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#343a40", width: "100%" }}>
        
      <Card className="p-4 text-light" style={{ width: "100%", maxWidth: "500px", backgroundColor: "#212529", borderRadius: "10px" }}>
      
        <FaHome
          className="position-absolute top-0 start-0 m-3 text-light"
          size={24}
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        />

        <Card.Title className="text-center mb-4">
          <FaUser className="me-2" size={24} />
          <span className="fs-4">My Profile</span>
        </Card.Title>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {userData && (
          <div className="profile-info">
            <div className="text-center mb-4">
              <div className="profile-avatar mb-3">
                <FaUser size={64} className="text-primary" />
              </div>
            </div>

            <Row className="mb-3 p-2" style={{ backgroundColor: "#2c3136", borderRadius: "5px" }}>
              <Col xs={4} className="text-info">Full Name:</Col>
              <Col xs={8} className="text-light">{userData.full_name}</Col>
            </Row>

            <Row className="mb-3 p-2" style={{ backgroundColor: "#2c3136", borderRadius: "5px" }}>
              <Col xs={4} className="text-info">Email:</Col>
              <Col xs={8} className="text-light">{userData.email}</Col>
            </Row>

            <div className="d-flex justify-content-center mt-4">
              <Button 
                variant="primary" 
                onClick={handleEditProfile}
                className="d-flex align-items-center"
              >
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfileViewComponent;