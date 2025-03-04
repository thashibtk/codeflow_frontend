// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import ProjectCollaboration from "./pages/Collaboration";
import LoginComponent from "./pages/Login";
import SignupComponent from "./pages/Signup";
import CodeFlowLanding from "./pages/Landingpage";
import ProjectDetails  from "./pages/ProjectDetails";

const App = () => {
  return (
    <Router>
      <div className="d-flex flex-column vh-100 w-100">
        <Navbar />
        <div className="flex-grow-1 d-flex w-100">
          <Routes>
            <Route path="/" element={<CodeFlowLanding />} />
            <Route path="login" element={<LoginComponent />} />
            <Route path="signup" element={<SignupComponent />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/editor/:id" element={<ProjectCollaboration />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

// background-color: rgba(var(--bs-dark-rgb), var(--bs-bg-opacity)) !important;
// }

export default App;