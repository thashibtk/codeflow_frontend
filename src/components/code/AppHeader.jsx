import React, { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import { FaCode, FaPlay, FaArrowLeft } from "react-icons/fa";

const AppHeader = ({ addToLogs, executeCode, selectedFile }) => {
  const [projectName, setProjectName] = useState("Loading...");

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // Use the addToLogs function with the proper tab name
      addToLogs("terminal", "No token found. User might not be logged in.");
      setProjectName("Unauthorized");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/projects/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        addToLogs("terminal", "Unauthorized access. Redirecting to login...");
        setProjectName("Unauthorized");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setProjectName(data[0].name || "Unknown Project");
        addToLogs("terminal", `Loaded project: ${data[0].name}`);
      } else {
        setProjectName("No Projects Found");
        addToLogs("terminal", "No projects available.");
      }
    } catch (error) {
      addToLogs("terminal", `Error fetching project: ${error.message}`);
      setProjectName("Error Loading");
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRun = () => {
    if (!selectedFile) {
      addToLogs("terminal", "❌ Please select a file to run first.");
      return;
    }

    addToLogs("terminal", `Running file: ${selectedFile.name}...`);
    
    // Determine language based on file extension
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    let language;
    
    switch (fileExtension) {
      case 'js':
      case 'jsx':
        language = 'javascript';
        break;
      case 'py':
        language = 'python';
        break;
      case 'java':
        language = 'java';
        break;
      case 'cpp':
      case 'cc':
        language = 'cpp';
        break;
      default:
        language = fileExtension;
    }
    
    // Call the executeCode function with the file's content
    executeCode(language, selectedFile.content);
  };

  return (
    <div className="app-header d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <FaCode className="me-2" />
        <h4 className="mb-0">{projectName}</h4>
      </div>
      <div className="button-group">
        <Button variant="outline-light" size="sm" className="me-2" onClick={handleGoBack}>
          <FaArrowLeft className="me-1" /> Go Back
        </Button>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleRun}
          disabled={!selectedFile}
        >
          <FaPlay className="me-1" /> Run
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;