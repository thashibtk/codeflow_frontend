import React, { useState, useEffect, useRef } from "react";
import { ListGroup, Button, Collapse, Modal, Alert } from "react-bootstrap";
import { 
  FaFileAlt, 
  FaFolderPlus, 
  FaPlay, 
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaTimes,
  FaCheck,
  FaChevronRight,
  FaChevronDown,
  FaPlus,
  FaTrash,
  FaExclamationTriangle
} from "react-icons/fa";  
import { toast } from 'react-toastify';

const FileExplorer = ({ 
  projectId, 
  onFileSelect,
  selectedFile,
  executeCode,
  addToLogs
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(true); // Control error visibility
  const [creationMode, setCreationMode] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');
  const [parentFolder, setParentFolder] = useState(null); // ID of parent folder for creation
  const [expandedFolders, setExpandedFolders] = useState({}); // Track which folders are expanded
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const inputRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      fetchFiles();
    }
  }, [projectId]);

  useEffect(() => {
    // Focus input when creation mode is activated
    if (creationMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creationMode]);

  // Reset error when starting to create a new item
  useEffect(() => {
    if (creationMode) {
      setError(null);
    }
  }, [creationMode]);

  const fetchFiles = async () => {
    const token = localStorage.getItem("accessToken");
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (response.status === 401) {
        console.error("❌ Unauthorized: Invalid or expired token. Logging out.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setError("Session expired. Please log in again.");
        setShowError(true);
        return;
      }
  
      if (!response.ok) {
        console.error(`❌ Failed to fetch files: ${response.status}`);
        setError(`Failed to fetch files: ${response.status}`);
        setShowError(true);
        return;
      }
  
      const data = await response.json();
      // Organize files into hierarchical structure
      setFiles(organizeFilesHierarchy(data));
    } catch (error) {
      console.error('Fetch error details:', error);
      setError('Network error. Unable to fetch files.');
      setShowError(true);
    }
  };

  // Organize files into parent-child hierarchy
  const organizeFilesHierarchy = (fileList) => {
    const rootFiles = [];
    const fileMap = {};
    
    // First pass: Create a map of all files by ID and initialize children array
    fileList.forEach(file => {
      file.children = [];
      fileMap[file.id] = file;
    });
    
    // Second pass: Organize into hierarchy
    fileList.forEach(file => {
      if (file.parent_folder) {
        if (fileMap[file.parent_folder]) {
          fileMap[file.parent_folder].children.push(file);
        } else {
          // If parent doesn't exist (shouldn't happen), add to root
          rootFiles.push(file);
        }
      } else {
        // No parent means it's a root-level file/folder
        rootFiles.push(file);
      }
    });
    
    return rootFiles;
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

  const handleRunCode = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to run first.");
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

  // Check for duplicate file/folder names
  const checkDuplicateName = (name, parentFolderId) => {
    // For root level items
    if (parentFolderId === null) {
      return files.some(file => 
        file.name === name && file.parent_folder === null
      );
    }
    
    // For nested items, we need to find the parent folder first
    const findParentFolder = (items, targetId) => {
      for (const item of items) {
        if (item.id === targetId) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const found = findParentFolder(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const parentFolder = findParentFolder(files, parentFolderId);
    if (!parentFolder) return false;
    
    return parentFolder.children.some(file => file.name === name);
  };

  const createNewItem = async (isFolder) => {
    if (!newItemName.trim()) {
      const errorMsg = `Please enter a ${isFolder ? "folder" : "file"} name`;
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
      return;
    }
  
    // Check if the name already exists within the same folder
    if (checkDuplicateName(newItemName, parentFolder)) {
      const errorMsg = `${isFolder ? "Folder" : "File"} with name "${newItemName}" already exists in this location`;
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
      return;
    }
  
    const token = localStorage.getItem("accessToken");
  
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/projects/${projectId}/files/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newItemName,
            is_folder: isFolder,
            content: isFolder ? null : "",
            parent_folder: parentFolder || null,
            project: projectId,
          }),
        }
      );
  
      // ✅ Read the response body only once
      const data = await response.json().catch(() => null);
  
      if (!response.ok) {
        console.error("❌ Error Response:", data);
  
        let errorMsg = "Failed to create file/folder.";
        if (response.status === 403) {
          errorMsg = "You do not have permission to add files.";
        } else if (response.status === 400 && data?.error) {
          errorMsg = data.error; // Show backend error message
        }
  
        setError(errorMsg);
        setShowError(true);
        toast.error(errorMsg);
        return;
      }
  
      // ✅ Success case
      fetchFiles();
      setCreationMode(null);
      setNewItemName("");
      setParentFolder(null);
      setError(null);
      toast.success(`${isFolder ? "Folder" : "File"} created successfully`);
    } catch (error) {
      console.error("Fetch error details:", error);
      const errorMsg = error.message || `Failed to create ${isFolder ? "folder" : "file"}`;
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
    }
  };
  
  
  
  const deleteItem = async () => {
    if (!deleteModal.item) return;
    
    const token = localStorage.getItem("accessToken");
    const item = deleteModal.item;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/${item.id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("File or folder not found");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete item");
        }
      }

      // Close the modal and refetch files
      setDeleteModal({ show: false, item: null });
      fetchFiles();
      setError(null);
      toast.success(`${item.is_folder ? "Folder" : "File"} deleted successfully`);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMsg = error.message || "Failed to delete item";
      setError(errorMsg);
      setShowError(true);
      toast.error(errorMsg);
    }
  };

  const confirmDelete = (item, e) => {
    e.stopPropagation(); // Prevent triggering folder toggle or file selection
    setDeleteModal({ show: true, item });
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setCreationMode(null);
      setNewItemName('');
      setParentFolder(null);
      setError(null);
    } else if (e.key === 'Enter') {
      createNewItem(creationMode === 'folder');
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const startCreatingInFolder = (folderId, type) => {
    setParentFolder(folderId);
    setCreationMode(type);
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: true // Ensure folder is expanded when creating inside
    }));
    setError(null);
  };

  // Recursive component to render file tree
  const renderFileTree = (items) => {
    return items.map((item) => (
      <React.Fragment key={item.id}>
        <ListGroup.Item
          className={`file-item ${item.is_folder ? 'folder' : 'file'} d-flex align-items-center`}
        >
          {item.is_folder ? (
            <>
              <Button 
                variant="link" 
                className="p-0 me-2 folder-toggle"
                onClick={() => toggleFolder(item.id)}
              >
                {expandedFolders[item.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </Button>
              {expandedFolders[item.id] ? <FaFolderOpen className="me-2" /> : <FaFolder className="me-2" />}
              <span className="flex-grow-1">{item.name}</span>
              <div className="folder-actions">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="icon-btn me-1" 
                  title="New Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreatingInFolder(item.id, 'folder');
                  }}
                >
                  <FaFolderPlus size={12} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="icon-btn me-1" 
                  title="New File"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCreatingInFolder(item.id, 'file');
                  }}
                >
                  <FaPlus size={12} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="icon-btn text-danger" 
                  title="Delete Folder"
                  onClick={(e) => confirmDelete(item, e)}
                >
                  <FaTrash size={12} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <FaFile className="me-2 ms-4" /> 
              <span 
                onClick={() => onFileSelect(item)} 
                style={{ cursor: 'pointer' }} 
                className="flex-grow-1"
              >
                {item.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="icon-btn text-danger" 
                title="Delete File"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(item, e);
                }}
              >
                <FaTrash size={12} />
              </Button>
            </>
          )}
        </ListGroup.Item>
        
        {item.is_folder && (
          <Collapse in={expandedFolders[item.id]}>
            <div className="ms-3 border-start ps-2">
              {/* Creation input inside folder */}
              {creationMode && parentFolder === item.id && (
                <ListGroup.Item className="d-flex align-items-center border-0">
                  {creationMode === 'folder' ? <FaFolder className="me-2" /> : <FaFile className="me-2" />}
                  <input 
                    ref={inputRef}
                    type="text"
                    className="form-control form-control-sm me-2"
                    placeholder={`Enter ${creationMode} name`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="me-1"
                    onClick={() => createNewItem(creationMode === 'folder')}
                  >
                    <FaCheck />
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => {
                      setCreationMode(null);
                      setNewItemName('');
                      setParentFolder(null);
                      setError(null);
                    }}
                  >
                    <FaTimes />
                  </Button>
                </ListGroup.Item>
              )}
              {item.children.length > 0 ? renderFileTree(item.children) : <p className="text-muted small m-2">Empty folder</p>}
            </div>
          </Collapse>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="panel-content file-explorer">
      <div className="panel-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaFileAlt className="me-2" /> Files
        </h6>
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="icon-btn me-1" 
            title="New Folder"
            onClick={() => {
              setCreationMode('folder');
              setParentFolder(null);
              setError(null);
            }}
          >
            <FaFolderPlus />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="icon-btn me-1" 
            title="New File"
            onClick={() => {
              setCreationMode('file');
              setParentFolder(null);
              setError(null);
            }}
          >
            <FaFileAlt />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="icon-btn" 
            title="Run Code"
            onClick={handleRunCode}
            disabled={!selectedFile}
          >
            <FaPlay />
          </Button>
        </div>
      </div>

      {/* Error display with toggle button */}
      {error && showError && (
        <Alert 
          variant="danger" 
          className="mt-2 mb-2 d-flex align-items-center justify-content-between"
        >
          <div>
            <FaExclamationTriangle className="me-2" />
            {error}
          </div>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => setShowError(false)}
          >
            <FaTimes />
          </Button>
        </Alert>
      )}

      {/* Error toggle button when errors are hidden */}
      {error && !showError && (
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="mt-2 mb-2" 
          onClick={() => setShowError(true)}
        >
          <FaExclamationTriangle className="me-1" /> Show Error
        </Button>
      )}

      <div className="file-list-container">
        <ListGroup variant="flush">
          {/* Root-level new item creation input */}
          {creationMode && parentFolder === null && (
            <ListGroup.Item className="d-flex align-items-center">
              {creationMode === 'folder' ? <FaFolder className="me-2" /> : <FaFile className="me-2" />}
              <input 
                ref={inputRef}
                type="text"
                className="form-control form-control-sm me-2"
                placeholder={`Enter ${creationMode} name`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                variant="success" 
                size="sm" 
                className="me-1"
                onClick={() => createNewItem(creationMode === 'folder')}
              >
                <FaCheck />
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => {
                  setCreationMode(null);
                  setNewItemName('');
                  setParentFolder(null);
                  setError(null);
                }}
              >
                <FaTimes />
              </Button>
            </ListGroup.Item>
          )}

          {files.length > 0 ? (
            renderFileTree(files)
          ) : (
            <p className="text-muted">No files found.</p>
          )}
        </ListGroup>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, item: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteModal.item && deleteModal.item.is_folder ? (
            <p>
              Are you sure you want to delete the folder <strong>{deleteModal.item.name}</strong> and all its contents? 
              This action cannot be undone.
            </p>
          ) : (
            <p>
              Are you sure you want to delete the file <strong>{deleteModal.item?.name}</strong>? 
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, item: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteItem}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FileExplorer;