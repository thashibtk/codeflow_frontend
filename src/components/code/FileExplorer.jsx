import React, { useState, useEffect, useRef } from "react";
import { ListGroup, Button } from "react-bootstrap";
import { 
  FaFileAlt, 
  FaFolderPlus, 
  FaPlay, 
  FaFolder, 
  FaFile,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import { toast } from 'react-toastify';

const FileExplorer = ({ 
  projectId, 
  onFileSelect 
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [creationMode, setCreationMode] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');
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
        return;
      }
  
      if (!response.ok) {
        console.error(`❌ Failed to fetch files: ${response.status}`);
        setError(`Failed to fetch files: ${response.status}`);
        return;
      }
  
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Fetch error details:', error);
      setError('Network error. Unable to fetch files.');
    }
  };

  const createNewItem = async (isFolder) => {
    if (!newItemName.trim()) {
      toast.error(`Please enter a ${isFolder ? 'folder' : 'file'} name`);
      return;
    }
  
    const token = localStorage.getItem("accessToken");
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/files/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newItemName,
          is_folder: isFolder,
          content: isFolder ? null : "",  // Ensure content exists for files
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("❌ Error Response:", data);
        throw new Error(data.error || "Failed to create item");
      }
  
      setFiles(prevFiles => [...prevFiles, data]);
      setCreationMode(null);
      setNewItemName("");
      toast.success(`${isFolder ? "Folder" : "File"} created successfully`);
    } catch (error) {
      console.error("Fetch error details:", error);
      toast.error(error.message || `Failed to create ${isFolder ? "folder" : "file"}`);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setCreationMode(null);
      setNewItemName('');
    } else if (e.key === 'Enter') {
      createNewItem(creationMode === 'folder');
    }
  };

  const handleRunCode = () => {
    toast.info('Code running functionality coming soon!');
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
            onClick={() => setCreationMode('folder')}
          >
            <FaFolderPlus />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="icon-btn me-1" 
            title="New File"
            onClick={() => setCreationMode('file')}
          >
            <FaFileAlt />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="icon-btn" 
            title="Run Code"
            onClick={handleRunCode}
          >
            <FaPlay />
          </Button>
        </div>
      </div>
      <div className="file-list-container">
        <ListGroup variant="flush">
          {/* New Item Creation Input */}
          {creationMode && (
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
                }}
              >
                <FaTimes />
              </Button>
            </ListGroup.Item>
          )}

          {files.length > 0 ? (
            files.map((file) => (
              <ListGroup.Item
                key={file.id}
                className={`file-item ${file.is_folder ? 'folder' : 'file'}`}
                onClick={() => !file.is_folder && onFileSelect(file)}
                style={{ cursor: file.is_folder ? 'default' : 'pointer' }}
              >
                {file.is_folder ? <FaFolder className="me-2" /> : <FaFile className="me-2" />} 
                {file.name}
              </ListGroup.Item>
            ))
          ) : (
            <p className="text-muted">No files found.</p>
          )}
        </ListGroup>
      </div>
      {error && <div className="text-danger">{error}</div>}
    </div>
  );
};

export default FileExplorer;