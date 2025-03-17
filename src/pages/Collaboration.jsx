import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";
import AppHeader from "../components/code/AppHeader";
import FileExplorer from "../components/code/FileExplorer";
import CodeEditor from "../components/code/CodeEditor";
import Terminal from "../components/code/Terminal";
import Collaborators from "../components/code/Collaborators";
import Chat from "../components/code/Chat";
import "bootstrap/dist/css/bootstrap.min.css";
import "./collaboration.css";

const ProjectCollaboration = () => {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [problemsLogs, setProblemsLogs] = useState([]);
  const [outputLogs, setOutputLogs] = useState([]);
  const [userPermission, setUserPermission] = useState('view'); // Default to view permission
  const [collaborators, setCollaborators] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Add event listener for run-code event
  useEffect(() => {
    // Event listener for clearing logs when run-code is triggered
    const handleRunCode = () => {
      clearLogs('all');
    };

    window.addEventListener('run-code', handleRunCode);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('run-code', handleRunCode);
    };
  }, []);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/users/me/", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json"
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          console.log("Current user data:", userData);
        } else {
          console.error("Failed to fetch current user:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch current user's permission for this project
  useEffect(() => {
    const fetchUserPermission = async () => {
      if (!currentUser) {
        console.log("Waiting for current user data...");
        return;
      }

      try {
        // Fetch collaborators to determine the current user's permission
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/collaborators/`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json"
          },
        });
        
        if (response.ok) {
          const collabData = await response.json();
          setCollaborators(collabData);
          console.log("Collaborators data:", collabData);
          
          // Find current user's permission
          const currentUserCollab = collabData.find(
            collab => {
              // Check all possible locations of user ID
              return (
                collab.user_id === currentUser.id || 
                (collab.user && collab.user.id === currentUser.id) ||
                (collab.user_details && collab.user_details.id === currentUser.id)
              );
            }
          );
          
          if (currentUserCollab) {
            setUserPermission(currentUserCollab.permission || 'view');
            console.log("User permission set to:", currentUserCollab.permission);
          } else {
            console.log("Current user not found in collaborators");
            
            // Check if user is project creator
            try {
              const projectResponse = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
                headers: {
                  "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                  "Content-Type": "application/json"
                },
              });
              
              if (projectResponse.ok) {
                const projectData = await projectResponse.json();
                if (projectData.creator === currentUser.id) {
                  setUserPermission('owner');
                  console.log("User is project creator, permission set to owner");
                }
              }
            } catch (error) {
              console.error("Error checking project creator:", error);
            }
          }
        } else {
          console.error("Failed to fetch collaborators:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching permission:", error);
        // Default to view permission on error
        setUserPermission('view');
      }
    };

    if (id && currentUser) {
      fetchUserPermission();
    }
  }, [id, currentUser]);

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  // Function to add logs dynamically
  const addToLogs = (tab, message) => {
    if (tab === "terminal") {
      setTerminalLogs((prev) => [...prev, message]);
    } else if (tab === "problems") {
      setProblemsLogs((prev) => [...prev, message]);
    } else if (tab === "output") {
      setOutputLogs((prev) => [...prev, message]);
    }
  };

  const clearLogs = (type = "all") => {
    if (type === "all" || type === "terminal") {
      setTerminalLogs([]);
    }
    if (type === "all" || type === "problems") {
      setProblemsLogs([]);
    }
    if (type === "all" || type === "output") {
      setOutputLogs([]);
    }
  };
  
  // Function to execute code and handle logs
  const executeCode = async (language, code, command = "") => {
    if (!code || !code.trim()) {
      addToLogs("problems", "❌ No code to execute.");
      return;
    }
  
    addToLogs("terminal", `> Executing ${language} code...`);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/code/execute/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          project_id: id,
          language,
          code,
          command,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Handle stdout
        if (result.stdout) addToLogs("output", result.stdout);
        // Handle stderr
        if (result.stderr) addToLogs("problems", `❌ ${result.stderr}`);
        // Execution success message
        addToLogs("terminal", "✅ Execution completed successfully.");
      } else {
        addToLogs("problems", `❌ Error: ${result.error || "Execution failed"}`);
      }
    } catch (error) {
      addToLogs("problems", `❌ Server error: ${error.message}`);
    }
  };

  // Handle collaborators change from Collaborators component
  const handleCollaboratorsChange = (updatedCollaborators) => {
    setCollaborators(updatedCollaborators);
  };
  
  return (
    <Container fluid className="code-collab-container p-0 m-0">
      <AppHeader 
        addToLogs={addToLogs} 
        executeCode={executeCode}
        selectedFile={selectedFile}
      />
      <PanelGroup direction="horizontal" className="panel-container">
        <Panel defaultSize={20} minSize={15}>
          <FileExplorer 
          projectId={id} 
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          executeCode={executeCode}
          addToLogs={addToLogs}
          />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={55} minSize={40}>
          <PanelGroup direction="vertical">
          <Panel defaultSize={isTerminalCollapsed ? 100 : 70} minSize={30}>
            {currentUser ? (
              <CodeEditor 
              projectId={id} 
              selectedFile={selectedFile} 
              currentUserPermission={userPermission}
              username={currentUser?.username || currentUser?.name || currentUser?.email || String(currentUser?.id) || "Anonymous"}
            />
            ) : (
              <div className="loading-editor">Loading editor...</div>
            )}
          </Panel>
            {!isTerminalCollapsed && <PanelResizeHandle className="resize-handle horizontal" />}
            {!isTerminalCollapsed && (
              <Panel defaultSize={30} minSize={10}>
                <Terminal
                  terminalLogs={terminalLogs}
                  problemsLogs={problemsLogs}
                  outputLogs={outputLogs}
                  onClearLogs={clearLogs}
                />
              </Panel>
            )}
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={25} minSize={15}>
          <div className="side-panel">
            <div className="collaborators-container">
              <Collaborators 
                projectId={id} 
                collaborators={collaborators}
                onCollaboratorsChange={handleCollaboratorsChange}
              />
            </div>
            {/* Pass the required props to Chat component */}
            {currentUser && (
              <Chat 
              projectId={id} 
              user={currentUser} 
              selectedFile={selectedFile}
            />
            )}
          </div>
        </Panel>
      </PanelGroup>
    </Container>
  );
};

export default ProjectCollaboration;