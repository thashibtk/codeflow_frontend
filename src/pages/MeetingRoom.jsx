"use client";
import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Global variable to track if a Daily.co instance exists
let globalDailyInstance = null;

const Meeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const containerRef = useRef(null);
  
  // Custom username state
  const [username, setUsername] = useState("User");
  
  // Meeting participants
  const [participants, setParticipants] = useState([]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (globalDailyInstance) {
        console.log("Destroying global Daily.co instance on unmount");
        globalDailyInstance.destroy();
        globalDailyInstance = null;
      }
    };
  }, []);

  // Fetch meeting details and username
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setJoinError("Authentication required. Please log in again.");
          return;
        }
        
        const response = await axios.get(
          `http://127.0.0.1:8000/api/meetings/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("Meeting data received:", response.data);
        setMeeting(response.data);
        setMeetingStarted(response.data.is_started);
        
        // Try to get user info
        try {
          const userResponse = await axios.get(
            "http://127.0.0.1:8000/api/users/me/",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          let fetchedUsername = "User";
          if (userResponse.data?.full_name) {
            fetchedUsername = userResponse.data.full_name;
          } else if (userResponse.data?.email) {
            fetchedUsername = userResponse.data.email.split('@')[0];
          }

          console.log("Fetched username:", fetchedUsername);
          setUsername(fetchedUsername);

        } catch (userError) {
          console.warn("Could not fetch user profile, using default username");
        }
        
      } catch (error) {
        console.error("Error fetching meeting details:", error);
        setJoinError(`Failed to load meeting details: ${error.response?.data?.detail || error.message}`);
      }
    };

    fetchMeetingDetails();
  }, [id]);

  // Auto-join after meeting is started and username is set
  useEffect(() => {
    if (meetingStarted && username !== "User" && !isJoining && !globalDailyInstance) {
      console.log("Auto-joining with username:", username);
      joinMeeting();
    }
  }, [meetingStarted, username]);

  const joinMeeting = async () => {
    if (!meeting?.room_url || !containerRef.current) {
      setJoinError("Missing room URL or container reference");
      return;
    }
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      // Clean up any existing instance
      if (globalDailyInstance) {
        globalDailyInstance.destroy();
        globalDailyInstance = null;
      }
      
      let roomUrl = meeting.room_url;
      // Make sure we have the full URL
      if (!roomUrl.startsWith('https://') && !roomUrl.startsWith('http://')) {
        roomUrl = `https://${roomUrl}`;
      }
      // Remove any query parameters if present
      roomUrl = roomUrl.split('?')[0]; 
      
      console.log("Creating new Daily.co frame with container:", containerRef.current);
      globalDailyInstance = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "none",
        },
      });
      
      console.log(`Joining meeting as: ${username}`);
      console.log("Joining meeting with Daily.co at URL:", roomUrl);
      
      // Setup event listeners for debugging and participant tracking
      globalDailyInstance.on("loading", () => {
        console.log("Daily.co iframe is loading");
      });
      
      globalDailyInstance.on("loaded", () => {
        console.log("Daily.co iframe loaded successfully");
      });
      
      globalDailyInstance.on("joining-meeting", () => {
        console.log("Joining meeting in progress");
      });
      
      globalDailyInstance.on("joined-meeting", () => {
        console.log("Successfully joined meeting");
        const currentParticipants = globalDailyInstance.participants();
        console.log("Current participants:", currentParticipants);
        setParticipants(Object.values(currentParticipants));
      });
      
      globalDailyInstance.on("participant-joined", (event) => {
        console.log("Participant joined:", event.participant);
        setParticipants(prevParticipants => [...prevParticipants, event.participant]);
      });
      
      globalDailyInstance.on("participant-left", (event) => {
        console.log("Participant left:", event.participant);
        setParticipants(prevParticipants => 
          prevParticipants.filter(p => p.session_id !== event.participant.session_id)
        );
      });
      
      globalDailyInstance.on("error", (e) => {
        console.error("Daily.co error:", e);
        setJoinError(`Daily.co error: ${e.errorMsg || JSON.stringify(e)}`);
      });
      
      // Actually join the meeting
      await globalDailyInstance.join({ url: roomUrl, userName: username });
      
      // Handle meeting exit
      globalDailyInstance.on('left-meeting', () => {
        console.log("User left the meeting");
        navigate('/dashboard');
      });
      
    } catch (error) {
      console.error("Error joining meeting:", error);
      setJoinError(`Failed to join: ${error.message || "Unknown error"}`);
      
      if (globalDailyInstance) {
        globalDailyInstance.destroy();
        globalDailyInstance = null;
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartMeeting = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setJoinError("Authentication required. Please log in again.");
        return;
      }
      
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/meetings/${id}/start/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Meeting started response:", response.data);
      
      // Make sure to update room_url if it was generated on start
      if (response.data && response.data.room_url) {
        setMeeting((prev) => ({ ...prev, room_url: response.data.room_url, is_started: true }));
      } else {
        setMeeting((prev) => ({ ...prev, is_started: true }));
      }
      
      setMeetingStarted(true);
    } catch (error) {
      console.error("Error starting meeting:", error);
      setJoinError(`Failed to start meeting: ${error.response?.data?.detail || error.message}`);
    }
  };
  
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Format meeting time
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Handle ISO format with T and Z (2025-03-17T16:30:00Z)
      if (dateString.includes('T')) {
        // Split the parts - strip off any Z at the end which indicates UTC
        const cleanDateString = dateString.replace('Z', '');
        const [datePart, timePart] = cleanDateString.split('T');
        const [year, month, day] = datePart.split('-');
        let [hours, minutes] = timePart ? timePart.split(':') : [0, 0];
        
        // Convert to 12-hour format with AM/PM for better readability
        let period = "AM";
        if (parseInt(hours) >= 12) {
          period = "PM";
          if (parseInt(hours) > 12) {
            hours = String(parseInt(hours) - 12).padStart(2, '0');
          }
        }
        if (hours === "00") hours = "12";
        
        // Format in a user-friendly way
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        return `${monthNames[parseInt(month)-1]} ${parseInt(day)}, ${year} at ${hours}:${minutes} ${period}`;
      } else {
        // For other formats, just return as is
        return dateString;
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original string if parsing fails
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-12">
          {joinError && (
            <div className="alert alert-danger text-center mb-4" role="alert">
              <p className="mb-1">{joinError}</p>
              <button className="btn btn-outline-danger mt-2" onClick={goToDashboard}>
                Go to Dashboard
              </button>
            </div>
          )}
          
          
          
          {/* Video container */}
          {meeting ? (
  <>
    {!meetingStarted ? (
      <div className="text-center p-5 bg-dark text-white rounded shadow-sm">
        <h4 className="mb-4">This meeting hasn't started yet</h4>
        <button
          onClick={handleStartMeeting}
          className="btn btn-primary btn-lg"
          disabled={isJoining}
        >
          {isJoining ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Starting...
            </>
          ) : "Start Meeting Now"}
        </button>
      </div>
    ) : (
      <div className="card shadow-sm bg-dark">
        <div className="card-body p-0">
          <div
            ref={containerRef}
            className="border border-secondary rounded"
            style={{ height: "600px", backgroundColor: "#212529" }}
          >
          </div>
        </div>
        {participants.length > 0 && (
          <div className="card-footer bg-dark text-white border-secondary">
            <p className="mb-1"><strong>Participants ({participants.length}):</strong></p>
            <div className="d-flex flex-wrap">
              {participants.map((participant, index) => (
                <span key={participant.session_id || index} className="badge bg-secondary me-2 mb-2">
                  {participant.user_name || `User ${index + 1}`}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="card-footer bg-dark text-white border-secondary">
          <button className="btn btn-outline-light" onClick={goToDashboard}>
            Exit to Dashboard
          </button>
        </div>
      </div>
    )}

              {/* Meeting details card */}
              {meeting && (
  <div className="card mb-4 shadow-sm mt-4 bg-dark text-white">
    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center border-secondary">
      <h3 className="mb-0">{meeting.title || "Meeting Room"}</h3>
      {meetingStarted && (
        <span className="badge bg-success">Active</span>
      )}
    </div>
    <div className="card-body border-secondary">
      <div className="row">
        <div className="col-md-6">
          <p><strong>Meeting :</strong> {meeting.name}</p>
          <p><strong>Status:</strong> {meetingStarted ? "In Progress" : "Not Started"}</p>
        </div>
      </div>
      {meeting.description && (
        <div className="mt-3">
          <strong>Description:</strong>
          <p className="mb-0">{meeting.description}</p>
        </div>
      )}
    </div>
  </div>
)}

            </>
          ) : (
            <div className="text-center p-5 bg-light rounded shadow-sm">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="lead">Loading meeting details...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meeting;