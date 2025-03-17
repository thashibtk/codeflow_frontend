import React, { useState, useEffect } from "react";
import { FaUserFriends, FaCopy, FaCheck } from "react-icons/fa";
import axios from "axios";

const Collaborators = ({ projectId, collaborators: initialCollaborators, onCollaboratorsChange }) => {
  const [collaborators, setCollaborators] = useState(initialCollaborators || []);
  const [loading, setLoading] = useState(!initialCollaborators);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [projectCode, setProjectCode] = useState("");

  useEffect(() => {
    // If collaborators are passed as props, use them
    if (initialCollaborators) {
      setCollaborators(initialCollaborators);
      setLoading(false);
    } else {
      // Otherwise fetch them
      fetchCollaborators();
    }
  }, [initialCollaborators, projectId]);

  // Fetch project code if not available
  useEffect(() => {
    const fetchProjectCode = async () => {
      if (!projectId) return;
      
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.project_code) {
          setProjectCode(response.data.project_code);
        }
      } catch (err) {
        console.error("Error fetching project code:", err);
      }
    };

    fetchProjectCode();
  }, [projectId]);

  const fetchCollaborators = async () => {
    if (!projectId) {
      setLoading(false);
      setError("No project ID provided");
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching collaborators for project: ${projectId}`);
      
      const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/collaborators/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Collaborators response:", response.data);
      
      
      if (Array.isArray(response.data)) {
        // Process collaborators to ensure user info is properly extracted
        const processedCollaborators = await Promise.all(
          response.data.map(async (collaborator) => {
            // If user details are missing, try to fetch them
            if (!collaborator.user_details && collaborator.user_id) {
              try {
                const userResponse = await axios.get(`http://127.0.0.1:8000/api/users/${collaborator.user_id}/`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json'
                  }
                });
                return { ...collaborator, user_details: userResponse.data };
              } catch (err) {
                console.error(`Error fetching details for user ${collaborator.user_id}:`, err);
                return collaborator;
              }
            }
            return collaborator;
          })
        );
        
        setCollaborators(processedCollaborators);
        // Notify parent component if callback exists
        if (onCollaboratorsChange) {
          onCollaboratorsChange(processedCollaborators);
        }
      } else {
        setCollaborators([]);
        setError("Invalid response format from server");
        console.error("Invalid response format:", response.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching collaborators:", err);
      setError(`Failed to load collaborators: ${err.message}`);
      setLoading(false);
      setCollaborators([]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(projectCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to log the structure of an object (for debugging)
  const logObjectStructure = (obj) => {
    if (!obj) return 'null';
    console.log('Object keys:', Object.keys(obj));
    return Object.keys(obj).join(', ');
  };

  const getDisplayName = (collaborator) => {
    if (collaborator.user_details?.full_name) return collaborator.user_details.full_name;
    if (collaborator.user_details?.email) {
      const emailParts = collaborator.user_details.email.split('@');
      return emailParts[0];
    }
    if (collaborator.user?.full_name) return collaborator.user.full_name;
    if (collaborator.user?.email) {
      const emailParts = collaborator.user.email.split('@');
      return emailParts[0];
    }
    if (collaborator.email) {
      const emailParts = collaborator.email.split('@');
      return emailParts[0];
    }
    if (collaborator.user_id) return `User ${collaborator.user_id}`;
    
    return 'Collaborator';
  };

  // Get the first letter for the avatar
  const getAvatarInitial = (collaborator) => {
    const name = getDisplayName(collaborator);
    return name.charAt(0).toUpperCase();
  };

  if (loading) return (
    <div className="panel-content collab-panel">
      <div className="d-flex justify-content-center py-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading collaborators...</span>
        </div>
        <span className="ms-2">Loading collaborators...</span>
      </div>
    </div>
  );

  return (
    <div className="panel-content collab-panel">
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaUserFriends className="me-2" /> Collaborators ({Array.isArray(collaborators) ? collaborators.length : 0})
        </h6>
        <button 
          className="btn btn-sm btn-outline-secondary" 
          onClick={fetchCollaborators}
          title="Refresh collaborators list"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>
      
      {error && <div className="alert alert-danger mt-2 p-2 small">{error}</div>}
      
      <div className="participants-list mt-3">
        {Array.isArray(collaborators) && collaborators.length > 0 ? (
          collaborators.map((collaborator) => (
            <div className="participant" key={collaborator.id || Math.random()}>
              <div className="participant-avatar">
                {getAvatarInitial(collaborator)}
              </div>
              <div className="participant-info">
                <div className="participant-name">{getDisplayName(collaborator)}</div>
                <div className="participant-role">{collaborator.permission || 'Viewer'}</div>
              </div>
              <div className={`participant-status ${collaborator.online ? 'online' : 'offline'}`}></div>
            </div>
          ))
        ) : (
          <div className="text-center py-3">No collaborators found</div>
        )}
      </div>
      
      {/* Project Code Section */}
      <div className="participants-list mt-3">
        <div className="d-flex justify-content-between align-items-center p-2 border border-secondary rounded">
          <div>
            <small className="text">Project Code:</small>
            <div className="fw-bold font-monospace">{projectCode}</div>
          </div>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={handleCopyCode}
            title="Copy project code"
          >
            {copied ? <FaCheck className="text-success" /> : <FaCopy />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Collaborators;