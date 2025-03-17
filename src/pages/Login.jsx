import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FaHome } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Show success message if redirected after logout
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
  
    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/login/", {
        email,
        password,
      });
  
      // Store JWT tokens
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
  
      console.log("Login successful:", response.data);
      navigate("/dashboard"); // Redirect to Dashboard after login
    } catch (error) {
      // Handle different error formats
      if (error.response && error.response.data) {
        if (error.response.data.non_field_errors) {
          // Handle non_field_errors array
          setError(error.response.data.non_field_errors[0]);
        } else if (error.response.data.error) {
          // Handle direct error message
          setError(error.response.data.error);
        } else {
          // Handle other error formats
          setError("Login failed. Please check your credentials.");
        }
      } else {
        setError("Cannot connect to server. Please try again later.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#343a40", width: "100%" }}>
      <Card className="p-4 text-light position-relative" style={{ width: "100%", maxWidth: "400px", backgroundColor: "#212529", borderRadius: "10px" }}>
        {/* Home Icon */}
        <FaHome
          className="position-absolute top-0 start-0 m-3 text-light"
          size={24}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        <h3 className="text-center mb-4">Login</h3>

        {/* Success Message (Logout Confirmation) */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        {/* Error Message */}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              className="bg-secondary text-light border-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              className="bg-secondary text-light border-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>

          {/* Signup Link */}
          <div className="text-center mt-3">
            <span className="text-light">Don't have an account? </span>
            <a href="/signup" className="text-primary">Sign Up</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginComponent;
