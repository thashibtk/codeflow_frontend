import React, { useEffect, useState } from "react";
import axios from "axios";

const Collaborators = ({ projectId }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/collaborators/`);
      setCollaborators(response.data);
    } catch (error) {
      setError("Error fetching collaborators.");
      console.error("Error fetching collaborators:", error);
    }
  };

  const addCollaborator = async () => {
    if (!newEmail.trim()) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/projects/${projectId}/collaborators/`, { email: newEmail });
      setCollaborators([...collaborators, { email: newEmail, id: Date.now() }]); 
      setNewEmail("");
      setError("");
    } catch (error) {
      setError("Failed to add collaborator.");
      console.error("Error adding collaborator:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this collaborator?");
    if (!confirmDelete) return;

    setCollaborators(collaborators.filter((collab) => collab.id !== userId)); // Optimistic UI update
    try {
      await axios.delete(`/api/projects/${projectId}/collaborators/${userId}/`);
    } catch (error) {
      setError("Failed to remove collaborator.");
      console.error("Error removing collaborator:", error);
      fetchCollaborators(); // Re-fetch data if removal fails
    }
  };

  return (
    <div className="collaborators">
      <h5>Collaborators</h5>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {collaborators.map((collab) => (
          <li key={collab.id}>
            {collab.email} 
            <button onClick={() => removeCollaborator(collab.id)} style={{ marginLeft: "10px" }}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Enter email"
        disabled={loading}
      />
      <button onClick={addCollaborator} disabled={loading}>
        {loading ? "Adding..." : "Add Collaborator"}
      </button>
    </div>
  );
};

export default Collaborators;
