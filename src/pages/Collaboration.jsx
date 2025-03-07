import React, { useState } from "react";
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
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Make sure to use consistent token key
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
  
  return (
    <Container fluid className="code-collab-container p-0 m-0">
      <AppHeader 
        addToLogs={addToLogs} 
        executeCode={executeCode}
        selectedFile={selectedFile}
      />
      <PanelGroup direction="horizontal" className="panel-container">
        <Panel defaultSize={20} minSize={15}>
          <FileExplorer projectId={id} onFileSelect={handleFileSelect} />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={55} minSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={isTerminalCollapsed ? 100 : 70} minSize={30}>
              <CodeEditor projectId={id} selectedFile={selectedFile} />
            </Panel>
            {!isTerminalCollapsed && <PanelResizeHandle className="resize-handle horizontal" />}
            {!isTerminalCollapsed && (
              <Panel defaultSize={30} minSize={10}>
                <Terminal
                  terminalLogs={terminalLogs}
                  problemsLogs={problemsLogs}
                  outputLogs={outputLogs}
                  onToggle={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
                />
              </Panel>
            )}
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={25} minSize={15}>
          <div className="side-panel">
            <div className="collaborators-container">
              <Collaborators />
            </div>
            <Chat />
          </div>
        </Panel>
      </PanelGroup>
    </Container>
  );
};

export default ProjectCollaboration;