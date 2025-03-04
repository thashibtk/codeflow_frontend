import React, { useState } from "react";
import { Button, Nav } from "react-bootstrap";
import { FaTerminal, FaBug, FaServer, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Terminal = ({ isCollapsed, toggleTerminal }) => {
  const [activeTab, setActiveTab] = useState("terminal");

  return (
    <div className={`panel-content terminal-panel ${isCollapsed ? "collapsed" : ""}`}>
      {!isCollapsed && (
        <>
          <div className="terminal-header">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link className={activeTab === "terminal" ? "active" : ""} onClick={() => setActiveTab("terminal")}>
                  <FaTerminal className="me-1" /> Terminal
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className={activeTab === "problems" ? "active" : ""} onClick={() => setActiveTab("problems")}>
                  <FaBug className="me-1" /> Problems
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className={activeTab === "output" ? "active" : ""} onClick={() => setActiveTab("output")}>
                  <FaServer className="me-1" /> Output
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Button variant="ghost" size="sm" onClick={toggleTerminal} title="Collapse Terminal">
              <FaChevronDown />
            </Button>
          </div>
          <div className="terminal-content">
            {activeTab === "terminal" && <div className="terminal-output">$ npm start</div>}
            {activeTab === "problems" && <div className="terminal-output">⚠ Warning: Unused variable</div>}
            {activeTab === "output" && <div className="terminal-output">Server running on port 3000</div>}
          </div>
        </>
      )}
      {isCollapsed && (
        <Button variant="ghost" size="sm" className="terminal-toggle-button" onClick={toggleTerminal}>
          <FaTerminal className="me-1" />
          <FaChevronUp className="me-1" />
          Terminal
        </Button>
      )}
    </div>
  );
};

export default Terminal;
