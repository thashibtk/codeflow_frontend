import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import CollaboratorsSection from '../components/CollabSection';
import CommentsSection from '../components/CommentSection';

const ProjectDetails = ({ onNavigateBack, onNavigateToEditor }) => {
  // Get project ID from URL params
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get projectId from multiple possible sources
  const projectId = params.id || 
                    params.projectId || 
                    (location.state && location.state.projectId) || 
                    new URLSearchParams(location.search).get('projectId');
                    
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        console.log("Missing project ID in URL parameters:", params);
        console.log("Current location:", window.location.href);
        setLoading(false);
        navigate('/projects');
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("You must be logged in to view project details");
          setLoading(false);
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        console.log("Fetching project with ID:", projectId);
        
        // Fetch current user ID
        const userResponse = await axios.get('http://127.0.0.1:8000/api/users/me/', config);
        const userId = userResponse.data.id;
        setCurrentUserId(userId);
        
        // Fetch project details
        const projectResponse = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/`, config);
        console.log("Project data received:", projectResponse.data);
        
        // Fetch collaborators from the correct endpoint
        const collaboratorsResponse = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/collaborators/`, config);
        console.log("Collaborators received:", collaboratorsResponse.data);
        
        // Determine if current user is the creator
        const creator = projectResponse.data.creator === userId;
        setIsCreator(creator);
        
        // Determine if current user is a collaborator (but not the creator)
        const collaborator = !creator && collaboratorsResponse.data.some(c => 
          c.user === userId || 
          c.user_id === userId || 
          (c.user && c.user.id === userId)
        );
        setIsCollaborator(collaborator);
        
        // Set project data with collaborators
        setProject({
          ...projectResponse.data,
          collaborators: collaboratorsResponse.data || []
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
        if (error.response && error.response.status === 404) {
          setError(`Project with ID ${projectId} not found`);
        } else {
          setError(error.response?.data?.detail || "Failed to load project details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate, params]);

  const handleCopyProjectCode = () => {
    if (project) {
      navigator.clipboard.writeText(project.project_code);
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    }
  };

  const handleBackToProjects = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoToEditor = () => {
    if (onNavigateToEditor) {
      onNavigateToEditor();
    } else {
      // Fallback navigation if prop isn't provided
      navigate(`/editor/${projectId}`);
    }
  };

  const refreshCollaborators = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      // Refresh collaborators list
      const collaboratorsResponse = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/collaborators/`, config);
      
      setProject(prev => ({
        ...prev,
        collaborators: collaboratorsResponse.data || []
      }));
    } catch (error) {
      console.error("Error refreshing collaborators:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
  
    const confirmDelete = window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You must be logged in to delete a project.");
        return;
      }
  
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
  
      await axios.delete(`http://127.0.0.1:8000/api/projects/${projectId}/`, config);
      
      alert("Project deleted successfully!");
      navigate('/dashboard'); // Redirect to projects list after deletion
  
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };
  
  const handleLeaveProject = async () => {
    if (!project || !currentUserId) return;
    
    const confirmLeave = window.confirm(`Are you sure you want to leave "${project.name}"? You will no longer have access to this project.`);
    if (!confirmLeave) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("You must be logged in to leave a project.");
        return;
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      // Find the collaborator entry for the current user
      const userCollaborator = project.collaborators.find(collab => {
        // Log the values to debug
        console.log("Checking collaborator:", collab);
        console.log("Current user ID:", currentUserId);
        console.log("Collaborator user_id:", collab.user_id);
        console.log("Collaborator user:", collab.user);
        
        // More robust check with explicit type conversion
        return String(collab.user_id) === String(currentUserId) || 
               String(collab.user) === String(currentUserId) || 
               (collab.user && String(collab.user.id) === String(currentUserId));
      });
      
      if (!userCollaborator) {
        console.error("Could not find collaborator record for current user");
        console.log("Current user ID:", currentUserId);
        console.log("Available collaborators:", project.collaborators);
        alert("You are not a collaborator on this project.");
        return;
      }
      
      console.log("Found collaborator to remove:", userCollaborator);
      
      // Remove the current user from project collaborators
      await axios.delete(`http://127.0.0.1:8000/api/projects/${projectId}/collaborators/${userCollaborator.id}/`, config);
      
      alert("You have left the project successfully!");
      navigate('/dashboard'); // Redirect to dashboard after leaving
      
    } catch (error) {
      console.error("Error leaving project:", error);
      console.log("Error response:", error.response?.data);
      alert("Failed to leave project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container text-white text-center py-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-white text-center py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-outline-light mt-3" onClick={handleBackToProjects}>
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container text-white text-center py-5">
        <div className="alert alert-warning" role="alert">
          Project not found or you don't have permission to view it.
        </div>
        <button className="btn btn-outline-light mt-3" onClick={handleBackToProjects}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-white py-4">
      
      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
        <div className="d-flex justify-content-between mb-4">
          <button className="btn btn-outline-light" onClick={handleBackToProjects}>
            <i className="bi bi-arrow-left me-2"></i> Back to Projects
          </button>
          <div>
            {isCreator && (
              <button className="btn btn-danger me-2" onClick={handleDeleteProject}>
                <i className="bi bi-trash me-2"></i> Delete Project
              </button>
            )}
            {isCollaborator && (
              <button className="btn btn-warning me-2" onClick={handleLeaveProject}>
                <i className="bi bi-box-arrow-right me-2"></i> Leave Project
              </button>
            )}
            <button className="btn btn-primary" onClick={handleGoToEditor}>
              <i className="bi bi-pencil-square me-2"></i> Go to Editor
            </button>
          </div>
      </div>

          <div className="mb-4">
            <h1 className="display-5 text-white">{project.name}</h1>
            <p className="lead text-white">{project.description || "No description provided"}</p>
            <div className="card bg-dark border-secondary mt-3">
              <div className="card-body d-flex align-items-center justify-content-between py-2">
                <div>
                  <span className="text-light me-2">Project Code:</span>
                  <span className="fw-bold font-monospace text-white">{project.project_code}</span>
                  <span className="ms-2 text-light small">(Share this code for others to join)</span>
                </div>
                <div className="position-relative">
                  <button className="btn btn-sm btn-outline-light" onClick={handleCopyProjectCode}>
                    <i className="bi bi-clipboard me-1"></i> Copy
                  </button>
                  {showCopiedTooltip && (
                    <div className="position-absolute top-100 start-50 translate-middle-x mt-2 bg-success text-white py-1 px-2 rounded small">
                      Copied!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Collaborators Section Component */}
          <CollaboratorsSection 
            projectId={projectId} 
            collaborators={project.collaborators}
            onCollaboratorsChange={refreshCollaborators}
          />
          
          {/* Comments Section Component */}
          <CommentsSection />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;