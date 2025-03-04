import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProjectDetails = ({ onNavigateBack, onNavigateToEditor }) => {
  // Get project ID from URL params - notice we're extracting 'id' now, not 'projectId'
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get projectId from multiple possible sources, starting with 'id' from params
  const projectId = params.id || 
                    params.projectId || 
                    (location.state && location.state.projectId) || 
                    new URLSearchParams(location.search).get('projectId');
                    
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

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
        const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/`, config);
        setProject(response.data);
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
      // Fallback navigation if prop isn't provided
      navigate('/projects');
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
            <button className="btn btn-primary" onClick={handleGoToEditor}>
              <i className="bi bi-pencil-square me-2"></i> Go to Editor
            </button>
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
          <div className="card bg-dark border-light mb-4">
            <div className="card-header bg-dark border-light">
              <h3 className="text-white">Collaborators</h3>
            </div>
            <div className="card-body">
              {project.collaborators && project.collaborators.length > 0 ? (
                <div className="row">
                  {project.collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="col-12 col-md-6 col-lg-4 mb-3">
                      <div className="d-flex align-items-center p-2 border border-secondary rounded bg-dark">
                        <img 
                          src={collaborator.avatar || 'https://via.placeholder.com/40'} 
                          alt={collaborator.name} 
                          className="rounded-circle me-3" 
                          width="40" 
                          height="40"
                        />
                        <div>
                          <h5 className="mb-0 text-white">{collaborator.name}</h5>
                          <small className="text-light">{collaborator.role || "Collaborator"}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-light">No collaborators yet.</p>
              )}
            </div>
          </div>
          <div className="card bg-dark border-light">
            <div className="card-header bg-dark border-light">
              <h3 className="text-white">Comments (Coming Soon)</h3>
            </div>
            <div className="card-body">
              <p className="text-light">The comment section will be available in a future update.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;