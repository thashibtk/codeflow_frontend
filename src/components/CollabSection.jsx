import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CollaboratorsSection = ({ projectId, onCollaboratorsChange }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [project, setProject] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [addCollaboratorError, setAddCollaboratorError] = useState('');
  const [addCollaboratorSuccess, setAddCollaboratorSuccess] = useState('');
  const [deletingCollaborator, setDeletingCollaborator] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState(null);
  const [editingPermission, setEditingPermission] = useState(false);
  const [collaboratorToEdit, setCollaboratorToEdit] = useState(null);
  const [newPermission, setNewPermission] = useState('');

  useEffect(() => {
    fetchProject();
    fetchCurrentUser();
    fetchCollaborators();
  }, [projectId]);

  const getAuthConfig = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("You must be logged in");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/projects/${projectId}/`,
        getAuthConfig()
      );
      setProject(response.data);
      // Check if current user is the project creator
      const token = localStorage.getItem("accessToken");
      if (token) {
        const user = JSON.parse(atob(token.split('.')[1]));
        setIsOwner(response.data.creator === user.user_id);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/users/me/`,
        getAuthConfig()
      );
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/projects/${projectId}/collaborators/`,
        getAuthConfig()
      );
      setCollaborators(response.data);
      if (onCollaboratorsChange) {
        onCollaboratorsChange();
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  const closeModal = () => {
    setCollaboratorEmail('');
    setAddCollaboratorError('');
    setAddCollaboratorSuccess('');
  };

  const openDeleteModal = (collaborator) => {
    setCollaboratorToDelete(collaborator);
  };

  const closeDeleteModal = () => {
    setCollaboratorToDelete(null);
  };

  const openPermissionModal = (collaborator) => {
    setCollaboratorToEdit(collaborator);
    setNewPermission(collaborator.permission || 'view');
  };

  const closePermissionModal = () => {
    setCollaboratorToEdit(null);
    setNewPermission('');
  };

  const submitAddCollaborator = async (e) => {
    e.preventDefault();
    
    if (!collaboratorEmail.trim()) {
      setAddCollaboratorError('Email is required');
      return;
    }

    setAddingCollaborator(true);
    setAddCollaboratorError('');

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/projects/${projectId}/collaborators/`, 
        { email: collaboratorEmail },
        getAuthConfig()
      );

      setAddCollaboratorSuccess(`Invitation sent to ${collaboratorEmail}`);
      setCollaboratorEmail('');
      fetchCollaborators();
      
      // Close modal after a delay
      setTimeout(() => {
        document.getElementById('closeModalButton').click();
      }, 2000);
      
    } catch (error) {
      console.error("Error adding collaborator:", error);
      setAddCollaboratorError(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        "Failed to add collaborator"
      );
    } finally {
      setAddingCollaborator(false);
    }
  };

  const submitDeleteCollaborator = async () => {
    if (!collaboratorToDelete) return;
    
    setDeletingCollaborator(true);
    const prevCollaborators = [...collaborators];
    
    try {
      // Optimistic UI update
      setCollaborators(collaborators.filter(c => c.id !== collaboratorToDelete.id));
      
      await axios.delete(
        `http://127.0.0.1:8000/api/projects/${projectId}/collaborators/${collaboratorToDelete.id}/`, 
        getAuthConfig()
      );
      
      // Close modal
      document.getElementById('closeDeleteModalButton').click();
      
    } catch (error) {
      // Revert optimistic update on error
      setCollaborators(prevCollaborators);
      console.error("Error removing collaborator:", error);
    } finally {
      setDeletingCollaborator(false);
      setCollaboratorToDelete(null);
    }
  };

  const submitUpdatePermission = async () => {
    if (!collaboratorToEdit) return;
    
    setEditingPermission(true);
    const prevCollaborators = [...collaborators];

    try {
      // Optimistic UI update
      setCollaborators(collaborators.map(c => 
        c.id === collaboratorToEdit.id ? {...c, permission: newPermission} : c
      ));
      
      await axios.patch(
        `http://127.0.0.1:8000/api/projects/${projectId}/collaborators/${collaboratorToEdit.id}/`, 
        { permission: newPermission },
        getAuthConfig()
      );
      
      // Close modal
      document.getElementById('closePermissionModalButton').click();
      
    } catch (error) {
      // Revert optimistic update on error
      setCollaborators(prevCollaborators);
      console.error("Error updating permission:", error);
    } finally {
      setEditingPermission(false);
      setCollaboratorToEdit(null);
    }
  };

  // Determine if a collaborator is the project owner
  const isCollaboratorOwner = (collaborator) => {
    if (!project || !collaborator.user_details) return false;
    return project.creator === collaborator.user_details.id;
  };

  return (
    <>
      <div className="card bg-dark border-light mb-4">
        <div className="card-header bg-dark border-light d-flex justify-content-between align-items-center">
          <h3 className="text-white mb-0">Collaborators</h3>
          {isOwner && (
            <button 
              className="btn btn-outline-light btn-sm" 
              data-bs-toggle="modal"
              data-bs-target="#addCollaboratorModal"
              title="Add Collaborator"
            >
              <i className="bi bi-person-plus"></i> Add Collaborator
            </button>
          )}
        </div>
        <div className="card-body">
          {collaborators && collaborators.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-dark table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Permission</th>
                    {isOwner && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {collaborators.map((collaborator) => {
                    const isOwnerCollab = isCollaboratorOwner(collaborator);
                    return (
                      <tr key={collaborator.id}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-2 text-white"
                              style={{ width: "30px", height: "30px", fontSize: "14px" }}
                            >
                              <span style={{ marginBottom: "2px" }}>
                                {(collaborator.user_details?.full_name || "U").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span>{collaborator.user_details?.full_name || "Collaborator"}</span>
                          </div>
                        </td>
                        <td className="align-middle">{collaborator.user_details?.email || "No email"}</td>
                        <td className="align-middle">
                          {isOwnerCollab ? (
                            <span className="badge bg-warning text-dark">Owner</span>
                          ) : (
                            <span className={`badge ${collaborator.permission === 'edit' ? 'bg-primary' : 'bg-secondary'}`}>
                              {collaborator.permission === 'edit' ? 'Editor' : 'Viewer'}
                            </span>
                          )}
                        </td>
                        {isOwner && (
                          <td className="align-middle">
                            {!isOwnerCollab && (
                              <div className="btn-group">
                                <button 
                                  className="btn btn-outline-primary btn-sm me-2"
                                  onClick={() => openPermissionModal(collaborator)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#changePermissionModal"
                                >
                                  <i className="bi bi-pencil"></i> Permission
                                </button>
                                <button 
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => openDeleteModal(collaborator)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteCollaboratorModal"
                                >
                                  <i className="bi bi-trash"></i> Remove
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-light">No collaborators yet.</p>
          )}
        </div>
      </div>

      {/* Add Collaborator Modal */}
      <div 
        className="modal fade" 
        id="addCollaboratorModal" 
        tabIndex="-1" 
        aria-labelledby="addCollaboratorModalLabel" 
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-white border border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title" id="addCollaboratorModalLabel">Add Collaborator</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeModalButton"
                onClick={closeModal}
              ></button>
            </div>
            <form onSubmit={submitAddCollaborator}>
              <div className="modal-body">
                {addCollaboratorError && (
                  <div className="alert alert-danger">{addCollaboratorError}</div>
                )}
                {addCollaboratorSuccess && (
                  <div className="alert alert-success">{addCollaboratorSuccess}</div>
                )}
                <div className="mb-3">
                  <label htmlFor="collaboratorEmail" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control bg-dark text-white border-secondary"
                    id="collaboratorEmail"
                    placeholder="Enter email address"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    required
                  />
                  <div className="form-text text-light">
                    An invitation will be sent to this email address
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button 
                  type="button" 
                  className="btn btn-outline-light" 
                  data-bs-dismiss="modal"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={addingCollaborator}
                >
                  {addingCollaborator ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    'Add Collaborator'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Collaborator Confirmation Modal */}
      <div 
        className="modal fade" 
        id="deleteCollaboratorModal" 
        tabIndex="-1" 
        aria-labelledby="deleteCollaboratorModalLabel" 
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-white border border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title" id="deleteCollaboratorModalLabel">Remove Collaborator</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closeDeleteModalButton"
                onClick={closeDeleteModal}
              ></button>
            </div>
            <div className="modal-body">
              {collaboratorToDelete && (
                <p>
                  Are you sure you want to remove 
                  <strong className="mx-1">
                    {collaboratorToDelete.user_details?.full_name || collaboratorToDelete.user_details?.email || "this collaborator"}
                  </strong> 
                  from this project? This action cannot be undone.
                </p>
              )}
            </div>
            <div className="modal-footer border-secondary">
              <button 
                type="button" 
                className="btn btn-outline-light" 
                data-bs-dismiss="modal"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={submitDeleteCollaborator}
                disabled={deletingCollaborator}
              >
                {deletingCollaborator ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Removing...
                  </>
                ) : (
                  'Remove Collaborator'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Permission Modal */}
      <div 
        className="modal fade" 
        id="changePermissionModal" 
        tabIndex="-1" 
        aria-labelledby="changePermissionModalLabel" 
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-white border border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title" id="changePermissionModalLabel">Change Permission</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                data-bs-dismiss="modal"
                aria-label="Close"
                id="closePermissionModalButton"
                onClick={closePermissionModal}
              ></button>
            </div>
            <div className="modal-body">
              {collaboratorToEdit && (
                <div>
                  <p>
                    Change permission for 
                    <strong className="mx-1">
                      {collaboratorToEdit.user_details?.full_name || collaboratorToEdit.user_details?.email || "this collaborator"}
                    </strong>
                  </p>
                  <div className="form-group mb-3">
                    <label htmlFor="permissionSelect" className="form-label">
                      Permission Level
                    </label>
                    <select 
                      className="form-select bg-dark text-white border-secondary"
                      id="permissionSelect"
                      value={newPermission || collaboratorToEdit.permission || 'view'}
                      onChange={(e) => setNewPermission(e.target.value)}
                    >
                      <option value="view">Viewer (can only view)</option>
                      <option value="edit">Editor (can make changes)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-secondary">
              <button 
                type="button" 
                className="btn btn-outline-light" 
                data-bs-dismiss="modal"
                onClick={closePermissionModal}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={submitUpdatePermission}
                disabled={editingPermission}
              >
                {editingPermission ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  'Update Permission'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollaboratorsSection;