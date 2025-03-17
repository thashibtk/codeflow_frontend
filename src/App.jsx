import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthNav from "./components/AuthNav";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import ProjectCollaboration from "./pages/Collaboration";
import LoginComponent from "./pages/Login";
import SignupComponent from "./pages/Signup";
import CodeFlowLanding from "./pages/Landingpage";
import ProjectDetails from "./pages/ProjectDetails";
import Meeting from "./pages/MeetingRoom";
import ProfileViewComponent from "./pages/Profile";
import ProfileEditComponent from "./pages/ProfileEdit";

// Wrapper component to conditionally render different Navbars
const AppLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Determine which type of navigation to show
  const isLandingPage = path === "/";
  const isAuthPage = path === "/login" || path === "/signup";
  
  
  return (
    <div className="d-flex flex-column vh-100 w-100">
      {!isLandingPage && !isAuthPage && <Navbar />}
      {isAuthPage && <AuthNav />}
      <div className="">
        <Routes>
          <Route path="/" element={<CodeFlowLanding />} />
          <Route path="login" element={<LoginComponent />} />
          <Route path="signup" element={<SignupComponent />} />
          <Route path="/profile" element={<ProfileViewComponent />} />
          <Route path="/profile/edit" element={<ProfileEditComponent />} /> 
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/editor/:id" element={<ProjectCollaboration />} />
          <Route path="/meeting/:id" element={<Meeting />} /> 
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;