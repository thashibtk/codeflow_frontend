import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";
import AppHeader from '../components/code/AppHeader';
import FileExplorer from "../components/code/FileExplorer";
import CodeEditor from "../components/code/CodeEditor";
import Terminal from "../components/code/Terminal";
import Collaborators from "../components/code/Collaborators";
import Chat from "../components/code/Chat";
import "bootstrap/dist/css/bootstrap.min.css";
import "./collaboration.css";

const ProjectCollaboration = () => {
  const { id } = useParams();
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <Container fluid className="code-collab-container p-0 m-0">
      <AppHeader />
      <PanelGroup direction="horizontal" className="panel-container">
        <Panel defaultSize={20} minSize={15}>
          <FileExplorer 
            projectId={id} 
            onFileSelect={handleFileSelect} 
          />
        </Panel>
        <PanelResizeHandle className="resize-handle" />
        <Panel defaultSize={55} minSize={40}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={isTerminalCollapsed ? 100 : 70} minSize={30}>
              <CodeEditor 
                projectId={id} 
                selectedFile={selectedFile} 
              />
            </Panel>
            {!isTerminalCollapsed && <PanelResizeHandle className="resize-handle horizontal" />}
            {!isTerminalCollapsed && (
              <Panel defaultSize={30} minSize={10}>
                <Terminal onToggle={() => setIsTerminalCollapsed(!isTerminalCollapsed)} />
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