import React, { useState, useEffect } from "react";
import { Button, Nav } from "react-bootstrap";
import { FaTerminal, FaBug, FaServer, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Terminal = ({ terminalLogs, problemsLogs, outputLogs, onToggle, onClearLogs, isCollapsed }) => {
  const [activeTab, setActiveTab] = useState("terminal");

  // Add a clear logs button
  const handleClearLogs = () => {
    if (onClearLogs) {
      onClearLogs(activeTab);
    }
  };

  return (
    <div className={`panel-content terminal-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="terminal-header">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link 
              className={activeTab === "terminal" ? "active" : ""} 
              onClick={() => setActiveTab("terminal")}
            >
              <FaTerminal className="me-1" /> Terminal
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              className={activeTab === "problems" ? "active" : ""} 
              onClick={() => setActiveTab("problems")}
            >
              <FaBug className="me-1" /> Problems
              {problemsLogs.length > 0 && (
                <span className="badge bg-danger ms-1">{problemsLogs.length}</span>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              className={activeTab === "output" ? "active" : ""} 
              onClick={() => setActiveTab("output")}
            >
              <FaServer className="me-1" /> Output
            </Nav.Link>
          </Nav.Item>
        </Nav>

      </div>

      {!isCollapsed && (
        <div className="terminal-content">
          {activeTab === "terminal" && (
            <div className="terminal-output">
              {terminalLogs.length > 0 ? terminalLogs.map((log, i) => <div key={i}>{log}</div>) : "No terminal logs yet."}
            </div>
          )}
          {activeTab === "problems" && (
            <div className="terminal-output">
              {problemsLogs.length > 0 ? problemsLogs.map((log, i) => <div key={i}>{log}</div>) : "No problems detected."}
            </div>
          )}
          {activeTab === "output" && (
            <div className="terminal-output">
              {outputLogs.length > 0 ? outputLogs.map((log, i) => <div key={i}>{log}</div>) : "No output logs available."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Terminal;