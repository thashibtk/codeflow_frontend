import React, { useState, useEffect } from 'react';
import './Landingpage.css';
import AppHeader from '../components/code/AppHeader';

const CodeFlowLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="codeflow-app">
      {/* Header */}
      <header className={scrolled ? 'header scrolled' : 'header'}>
        <div className="container">
          <div className="logo">
            <div className="logo-icon">C</div>
            <span>CodeFlow</span>
          </div>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={mobileMenuOpen ? 'active' : ''}>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </nav>
          
          <div className="auth-buttons">
            <a href="#login" className="login-btn">Log in</a>
            <a href="#signup" className="signup-btn">Get started</a>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Collaborative Coding Made <span>Simple</span></h1>
            <p>
              CodeFlow brings teams together with real-time collaboration, intelligent code reviews, 
              and streamlined project management in one unified platform.
            </p>
            <div className="hero-buttons">
              <a href="#signup" className="primary-btn">Start for free</a>
              <a href="#demo" className="secondary-btn">Watch demo</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://via.placeholder.com/600x360" alt="CodeFlow Platform Screenshot" />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why choose CodeFlow?</h2>
            <p>
              Designed by developers for developers, our platform solves the challenges of modern software development.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.5V19.5M18.75 12H5.25" />
                </svg>
              </div>
              <h3>Real-time Collaboration</h3>
              <p>Code together in real-time with multiple team members, no more merge conflicts.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h3>Intelligent Code Reviews</h3>
              <p>AI-powered suggestions and automated code quality checks to improve your codebase.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3>Project Management</h3>
              <p>Integrated task tracking, milestones, and team coordination all in one place.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to transform your development workflow?</h2>
            <p>
              Join thousands of development teams already using CodeFlow to ship better code, faster.
            </p>
            <a href="#signup" className="primary-btn large">Start your free trial</a>
            <p className="cta-note">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="logo">
              <div className="logo-icon">C</div>
              <span>CodeFlow</span>
            </div>
            <div className="copyright">
              © {new Date().getFullYear()} CodeFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodeFlowLanding;