import React, { useState, useEffect } from "react";
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

  const fetchLatestFileContent = async () => {
    if (!selectedFile) return null;
    
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const projectId = selectedFile.project_id || window.location.pathname.split('/').filter(Boolean)[1];
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/${selectedFile.id}/content/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch latest file content`);

      const data = await response.json();
      return data.content;
    } catch (error) {
      addToLogs("terminal", `❌ Error refreshing file content: ${error.message}`);
      return null;
    }
  };

  const handleRun = async () => {
    if (!selectedFile) {
      addToLogs("terminal", "❌ Please select a file to run first.");
      return;
    }

    // Trigger the run-code event to clear logs
    window.dispatchEvent(new CustomEvent('run-code'));
    
    // Add initial run message after clearing logs
    addToLogs("terminal", `Running file: ${selectedFile.name}...`);

    // Get latest file content
    const latestContent = await fetchLatestFileContent();
    if (!latestContent) {
      addToLogs("terminal", "❌ Could not retrieve the latest file content.");
      return;
    }
    
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
    executeCode(language, latestContent);
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