import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FaHome } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; // Import Axios

const SignupComponent = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required!");
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
  
    if (!formData.termsAccepted) {
      setError("You must accept the Terms and Conditions!");
      return;
    }
  
    setError("");
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/signup/", {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
  
      console.log("Signup Success:", response.data);
      setSuccess("Account created successfully! Redirecting to login...");
      
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2s
    } catch (err) {
      if (err.response && err.response.data.email) {
        // Check if backend returns an error for duplicate email
        setError("You already have an account. Please login.");
      } else {
        setError("Signup failed. Please try again.");
      }
      console.error(err);
    }
  };
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#343a40", width: "100%" }}>
      <Card className="p-4 text-light" style={{ width: "100%", maxWidth: "400px", backgroundColor: "#212529", borderRadius: "10px" }}>
        <FaHome 
          className="position-absolute top-0 start-0 m-3 text-light"
          size={24}
          onClick={() => navigate("/")} 
          style={{ cursor: "pointer" }}
        />

        <Card.Title className="text-center">Sign Up</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              placeholder="Enter full name"
              className="bg-secondary text-light border-0"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              className="bg-secondary text-light border-0"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              className="bg-secondary text-light border-0"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              className="bg-secondary text-light border-0"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Terms & Conditions Checkbox */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="termsAccepted"
              label={<span className="text-light">I accept the <a href="#" className="text-primary">Terms & Conditions</a></span>}
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Sign Up
          </Button>

          {/* Already have an account? */}
          <div className="text-center mt-3">
            <span className="text-light">Already have an account? </span>
            <a href="/login" className="text-primary">Login</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SignupComponent;
