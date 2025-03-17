import React, { useState, useEffect } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { FaHome, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileEditComponent = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [originalEmail, setOriginalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

        setFormData({
          fullName: response.data.full_name,
          email: response.data.email,
          password: "",
          confirmPassword: "",
        });
        setOriginalEmail(response.data.email);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.fullName || !formData.email) {
      setError("Name and email are required!");
      return;
    }

    // If password is being changed, validate password match
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
    }

    setError("");

    // Prepare data for update
    const updateData = {
      full_name: formData.fullName,
      email: formData.email,
    };

    // Only include password if it's being changed
    if (formData.password) {
      updateData.password = formData.password;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.patch(
        "http://127.0.0.1:8000/api/users/me/",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        
      );

      console.log("Profile Update Success:", response.data);
      setSuccess("Profile updated successfully!");
    setTimeout(() => {
    if (originalEmail !== formData.email) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    } else {
        navigate("/profile", { state: { successMessage: "Profile updated successfully!" } });
    }
    }, 1000);

    } catch (err) {
      if (err.response && err.response.data.email) {
        setError("This email is already in use by another account.");
      } else {
        setError("Update failed. Please try again.");
      }
      console.error(err);
    }
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
      <Card className="p-4 text-light" style={{ width: "100%", maxWidth: "400px", backgroundColor: "#212529", borderRadius: "10px" }}>
        <FaHome
          className="position-absolute top-0 start-0 m-3 text-light"
          size={24}
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        />

        <Card.Title className="text-center mb-4">
          <FaUser className="me-2" />
          Edit Profile
        </Card.Title>
        
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
            {originalEmail !== formData.email && (
              <Form.Text className="text-warning">
                Changing your email will require you to log in again.
              </Form.Text>
            )}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>New Password (leave blank to keep current)</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter new password"
              className="bg-secondary text-light border-0"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              className="bg-secondary text-light border-0"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={!formData.password}
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={() => navigate("/profile")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileEditComponent;