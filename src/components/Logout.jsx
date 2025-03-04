import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";

const LogoutComponent = ({ showModal, handleClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh");

    if (!refreshToken) {
      handleClose();
      navigate("/login", { state: { message: "Logged out successfully!" } });
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/logout/", { refresh: refreshToken });

      // Clear tokens from localStorage
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      handleClose();
      navigate("/login", { state: { message: "Logged out successfully!" } }); // Redirect with message
    } catch (error) {
      console.error("Logout failed:", error);
      handleClose();
      navigate("/login", { state: { message: "Logout failed. Please try again." } });
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} centered backdrop="static">
        <Modal.Header closeButton className="bg-dark text-white border-secondary">
            <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
            Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
            <Button variant="outline-light" onClick={handleClose} className="px-4">
            Cancel
            </Button>
            <Button variant="danger" onClick={handleLogout} className="px-4">
            Yes, Logout
            </Button>
        </Modal.Footer>
    </Modal>

  );
};

export default LogoutComponent;
