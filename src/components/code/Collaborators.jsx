import React, { useState } from "react";
import { FaUserFriends, FaCopy, FaCheck } from "react-icons/fa";

const Collaborators = ({ projectCode = "ABC-123-XYZ" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(projectCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="panel-content collab-panel">
      <div className="panel-header">
        <h6 className="mb-0">
          <FaUserFriends className="me-2" /> Collaborators
        </h6>
      </div>
      <div className="participants-list">
        <div className="participant">
          <div className="participant-avatar">A</div>
          <div className="participant-name">Alice</div>
          <div className="participant-status online"></div>
        </div>
        <div className="participant">
          <div className="participant-avatar">B</div>
          <div className="participant-name">Bob</div>
          <div className="participant-status online"></div>
        </div>
      </div>
      
      {/* Project Code Section */}
      <div className="participants-list">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text">Project Code:</small>
            <div className="fw-bold font-monospace">{projectCode}</div>
          </div>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={handleCopyCode}
            title="Copy project code"
          >
            {copied ? <FaCheck className="text-success" /> : <FaCopy />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Collaborators;