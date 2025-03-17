import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landingpage.css';
import { Navbar } from 'react-bootstrap';
import collabImage from "../assets/collab.jpg";
import livechat from "../assets/livecollab.jpg";
import meetingimg from "../assets/meeting.jpg";

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
  <Navbar.Brand href="#" className="fw-bold text-uppercase text-light">
    <span style={{ color: "#0d6efd" }}>Code</span>Flow
  </Navbar.Brand>
  
  <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
    <span></span>
    <span></span>
    <span></span>
  </button>
  
  <nav className={mobileMenuOpen ? 'active' : ''}>
    <ul>
      <li><a href="#features">Features</a></li>
      <li><a href="#solutions">Solutions</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
      <li><a href="/login" >Login</a></li>
      <li><a href="/signup" className="btn btn-primary">Sign Up</a></li>
    </ul>
  </nav>
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
              <Link to="/signup" className="primary-btn">Start for free</Link>
              <a href="#demo" className="secondary-btn">Watch demo</a>
            </div>
          </div>
          <div className="hero-image">
          <img src={collabImage} alt="CodeFlow Platform Screenshot" />
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
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h3>Live Chat & Communication</h3>
              <p>Built-in messaging with code snippet sharing and thread organization for efficient team discussions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Virtual Meetings Integration</h3>
              <p>Schedule and join code review sessions with integrated audio/video calls directly from your project.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18.4 9.6a9 9 0 1 0 .2 .2" />
                </svg>
              </div>
              <h3>Advanced Analytics</h3>
              <p>Get insights on project progress, code quality, and team performance with detailed dashboards.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Collaboration Section */}
      <section id="solutions" className="collaboration">
        <div className="container">
          <div className="section-header">
            <h2>Seamless Collaboration Tools</h2>
            <p>Bring your team together regardless of location with our comprehensive collaboration suite.</p>
          </div>
          
          <div className="collaboration-features">
            <div className="collab-feature">
              <div className="collab-image">
              <img src={livechat} alt="Live Coding Session" />
              </div>
              <div className="collab-content">
                <h3>Live Collaborative Editing</h3>
                <p>Code together in real-time with cursor presence, live syntax highlighting, and simultaneous editing.</p>
                <ul>
                  <li>Multiple cursors with developer identification</li>
                  <li>Real-time syntax error detection</li>
                  <li>Integrated voice chat during coding sessions</li>
                  <li>Automatic version history and snapshots</li>
                </ul>
              </div>
            </div>
            
            <div className="collab-feature reverse">
              <div className="collab-content">
                <h3>Team Meeting Hub</h3>
                <p>Schedule, join and manage code-focused meetings with your development team.</p>
                <ul>
                  <li>Code-aware screen sharing options</li>
                  <li>Record meetings with automatic transcription</li>
                  <li>Create action items and tasks during meetings</li>
                  <li>Integration with popular calendar applications</li>
                </ul>
              </div>
              <div className="collab-image">
                <img src={meetingimg} alt="Team Meeting Hub" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What developers are saying</h2>
            <p>Join thousands of satisfied development teams around the world.</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"CodeFlow has transformed how our distributed team works together. Real-time collaboration and integrated meetings have cut our development time in half."</p>
              </div>
              <div className="testimonial-author">
                <img src="https://via.placeholder.com/60x60" alt="Avatar" />
                <div>
                  <h4>Sarah Johnson</h4>
                  <p>CTO, TechInnovate</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The live chat integration directly with our codebase has dramatically improved our team communication and problem-solving speed."</p>
              </div>
              <div className="testimonial-author">
                <img src="https://via.placeholder.com/60x60" alt="Avatar" />
                <div>
                  <h4>David Chen</h4>
                  <p>Lead Developer, Stackwave</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a remote-first company, the virtual meetings and collaboration features in CodeFlow have become essential to maintaining our productivity."</p>
              </div>
              <div className="testimonial-author">
                <img src="https://via.placeholder.com/60x60" alt="Avatar" />
                <div>
                  <h4>Alicia Rivera</h4>
                  <p>Engineering Manager, DevFlow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      {/* <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, transparent pricing</h2>
            <p>Choose the plan that works best for your team.</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="price">
                  <span className="amount">$12</span>
                  <span className="period">/user/month</span>
                </div>
                <p>For small teams getting started</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Up to 5 team members</li>
                  <li>Real-time code collaboration</li>
                  <li>Basic project management</li>
                  <li>Live chat</li>
                  <li>5GB storage</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <Link to="/signup?plan=starter" className="primary-btn">Get started</Link>
              </div>
            </div>
            
            <div className="pricing-card featured">
              <div className="pricing-header">
                <div className="popular-tag">Most Popular</div>
                <h3>Professional</h3>
                <div className="price">
                  <span className="amount">$29</span>
                  <span className="period">/user/month</span>
                </div>
                <p>For growing development teams</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Unlimited team members</li>
                  <li>Advanced collaboration tools</li>
                  <li>Full project management suite</li>
                  <li>Virtual meetings integration</li>
                  <li>25GB storage</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <Link to="/signup?plan=professional" className="primary-btn">Get started</Link>
              </div>
            </div>
            
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <div className="price">
                  <span className="amount">Custom</span>
                </div>
                <p>For large organizations and agencies</p>
              </div>
              <div className="pricing-features">
                <ul>
                  <li>Everything in Professional</li>
                  <li>Dedicated account manager</li>
                  <li>Custom integrations</li>
                  <li>On-premise deployment option</li>
                  <li>Unlimited storage</li>
                  <li>SLA guarantees</li>
                  <li>24/7 premium support</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <Link to="/contact-sales" className="secondary-btn">Contact sales</Link>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to transform your development workflow?</h2>
            <p>
              Join thousands of development teams already using CodeFlow to ship better code, faster.
            </p>
            <Link to="/signup" className="primary-btn large">Start your free trial</Link>
            <p className="cta-note">No credit card required. 14-day free trial.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CodeFlowLanding;