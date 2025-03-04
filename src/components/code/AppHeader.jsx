import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { FaCode, FaPlay, FaArrowLeft } from "react-icons/fa";

const AppHeader = () => {
  const [projectName, setProjectName] = useState("Loading...");

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    const token = localStorage.getItem("accessToken"); // Get token from localStorage
  
    if (!token) {
      console.error("No token found. User might not be logged in.");
      setProjectName("Unauthorized");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/", {
        headers: {
          "Authorization": `Bearer ${token}`, // Pass token in request
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 401) {
        console.error("Unauthorized access. Redirecting to login.");
        setProjectName("Unauthorized");
        localStorage.removeItem("accessToken"); // Clear token if invalid
        window.location.href = "/login"; // Redirect to login page
        return;
      }
  
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setProjectName(data[0].name || "Unknown Project"); // Display first project
      } else {
        setProjectName("No Projects Found");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      setProjectName("Error Loading");
    }
  };
  

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="app-header d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <FaCode className="me-2" />
        <h4 className="mb-0">{projectName}</h4> {/* Corrected */}
      </div>
      <div className="button-group">
        <Button variant="outline-light" size="sm" className="me-2" onClick={handleGoBack}>
          <FaArrowLeft className="me-1" /> Go Back
        </Button>
        <Button variant="outline-light" size="sm">
          Share
        </Button>
        <Button variant="primary" size="sm">
          <FaPlay className="me-1" /> Run Project
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
