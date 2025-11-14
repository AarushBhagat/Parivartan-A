import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [language, setLanguage] = useState('english');

  const content = {
    english: {
      logo: "Parivartan",
      contact: "Contact Us",
      about: "About",
      faq: "FAQ",
      login: "Login",
      languageLabel: "Language",
      bannerTitle: "Welcome to Parivartan Portal",
      bannerSubtitle: "Your gateway to digital transformation and efficient government services",
      aboutTitle: "About Us",
      aboutText: "Parivartan is a comprehensive digital transformation platform designed to streamline government services and enhance citizen engagement. Our mission is to provide transparent, efficient, and accessible government services to all citizens through innovative technology solutions.",
      updatesTitle: "Latest Updates",
      updates: [
        "New online grievance system launched",
        "Updated citizen portal features",
        "Improved department coordination",
        "Enhanced security measures implemented"
      ],
      servicesTitle: "Our Services",
      registerTitle: "Register",
      registerDesc: "Create a new account to access government services",
      loginTitle: "Login",
      loginDesc: "Access your existing account and services",
      statusTitle: "View Status", 
      statusDesc: "Check the status of your applications and grievances",
      contactTitle: "Contact Us",
      contactDesc: "Get in touch with our support team for assistance",
      footerText: "© 2025 Parivartan. All rights reserved.",
      departments: "18 Government Departments",
      services: "50+ Online Services",
      citizens: "10,000+ Citizens Served"
    },
    hindi: {
      logo: "परिवर्तन",
      contact: "संपर्क करें",
      about: "हमारे बारे में",
      faq: "सामान्य प्रश्न",
      login: "लॉगिन",
      languageLabel: "भाषा",
      bannerTitle: "परिवर्तन पोर्टल में आपका स्वागत है",
      bannerSubtitle: "डिजिटल रूपांतरण और कुशल सरकारी सेवाओं का आपका द्वार",
      aboutTitle: "हमारे बारे में",
      aboutText: "परिवर्तन एक व्यापक डिजिटल रूपांतरण प्लेटफॉर्म है जो सरकारी सेवाओं को सुव्यवस्थित करने और नवीन तकनीकी समाधानों के माध्यम से नागरिक सहभागिता बढ़ाने के लिए डिज़ाइन किया गया है।",
      updatesTitle: "नवीनतम अपडेट",
      updates: [
        "नई ऑनलाइन शिकायत प्रणाली शुरू",
        "अपडेटेड नागरिक पोर्टल सुविधाएं",
        "बेहतर विभाग समन्वय",
        "उन्नत सुरक्षा उपाय लागू"
      ],
      servicesTitle: "हमारी सेवाएं",
      registerTitle: "पंजीकरण",
      registerDesc: "सरकारी सेवाओं का उपयोग करने के लिए नया खाता बनाएं",
      loginTitle: "लॉगिन",
      loginDesc: "अपने मौजूदा खाते और सेवाओं तक पहुंचें",
      statusTitle: "स्थिति देखें",
      statusDesc: "अपने आवेदनों और शिकायतों की स्थिति जांचें",
      contactTitle: "संपर्क करें",
      contactDesc: "सहायता के लिए हमारी सहायता टीम से संपर्क करें",
      footerText: "© 2025 परिवर्तन। सभी अधिकार सुरक्षित।",
      departments: "18 सरकारी विभाग",
      services: "50+ ऑनलाइन सेवाएं",
      citizens: "10,000+ नागरिकों की सेवा"
    }
  };

  const currentContent = content[language];

  const departments = [
    { name: "Municipal Corporation", icon: "🏛️" },
    { name: "Health Department", icon: "🏥" },
    { name: "Education Department", icon: "📚" },
    { name: "Revenue Department", icon: "💼" },
    { name: "Police Department", icon: "👮" },
    { name: "Public Works Department", icon: "🏗️" },
    { name: "Transport Department", icon: "🚌" },
    { name: "Agriculture Department", icon: "🌾" },
    { name: "Water Supply", icon: "💧" },
    { name: "Electricity Board", icon: "⚡" },
    { name: "Food & Supply", icon: "🍽️" },
    { name: "Social Welfare", icon: "🤝" }
  ];

  return (
    <div className="home-page">
      {/* Header Navigation */}
      <header className="home-header">
        <div className="header-container">
          <div className="logo-section">
            <h1 className="logo-text">{currentContent.logo}</h1>
          </div>
          
          <nav className="nav-menu">
            <a href="#about" className="nav-link">{currentContent.about}</a>
            <a href="#contact" className="nav-link">{currentContent.contact}</a>
            <Link to="/faq" className="nav-link">{currentContent.faq}</Link>
            <Link to="/login" className="login-btn">{currentContent.login}</Link>
          </nav>
        </div>
      </header>

      {/* Language Selector */}
      <div className="language-selector-container">
        <div className="language-selector">
          <label htmlFor="language">{currentContent.languageLabel}:</label>
          <select 
            id="language"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-dropdown"
          >
            <option value="english">English</option>
            <option value="hindi">हिंदी</option>
          </select>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h1>{currentContent.bannerTitle}</h1>
            <p>{currentContent.bannerSubtitle}</p>
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-icon">🏛️</div>
                <h3>18</h3>
                <p>{currentContent.departments.split(' ')[1]} {currentContent.departments.split(' ')[2]}</p>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🌐</div>
                <h3>50+</h3>
                <p>{currentContent.services.split(' ')[1]} {currentContent.services.split(' ')[2]}</p>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <h3>10K+</h3>
                <p>{currentContent.citizens.split(' ')[1]} {currentContent.citizens.split(' ')[2]}</p>
              </div>
            </div>
          </div>
          <div className="banner-images">
            <div className="dept-showcase">
              <h3>Government Departments</h3>
              <div className="dept-grid">
                {departments.slice(0, 6).map((dept, index) => (
                  <div key={index} className="dept-card">
                    <div className="dept-icon">{dept.icon}</div>
                    <span>{dept.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Banner */}
      <section className="instructions-banner">
        <div className="instructions-content">
          <div className="instruction-card">
            <h3>📋 How to Use</h3>
            <ul>
              <li>Select your user type (Citizen, Admin, Staff, Department)</li>
              <li>Login with your credentials</li>
              <li>Access relevant services and submit grievances</li>
              <li>Track your application status in real-time</li>
            </ul>
          </div>
          <div className="instruction-card">
            <h3>📞 Support</h3>
            <ul>
              <li>24/7 helpline: 1800-XXX-XXXX</li>
              <li>Email: support@kapurthala.gov.in</li>
              <li>Office hours: 9 AM - 5 PM</li>
              <li>Emergency services available</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="main-content">
        <div className="content-container">
          {/* About Us Section */}
          <div className="about-section" id="about">
            <h2>{currentContent.aboutTitle}</h2>
            <p>{currentContent.aboutText}</p>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <h4>Secure</h4>
                <p>Advanced security measures to protect your data</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h4>Fast</h4>
                <p>Quick processing of applications and services</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <h4>Accessible</h4>
                <p>Available 24/7 from any device</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤝</div>
                <h4>Transparent</h4>
                <p>Real-time status updates and clear processes</p>
              </div>
            </div>
          </div>

          {/* Updates Section */}
          <div className="updates-section">
            <h2>{currentContent.updatesTitle}</h2>
            <div className="updates-list">
              {currentContent.updates.map((update, index) => (
                <div key={index} className="update-item">
                  <div className="update-date">
                    {new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                  <div className="update-text">{update}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <h2 className="services-title">{currentContent.servicesTitle}</h2>
          <p className="services-subtitle">Access government services with ease and transparency</p>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📝</div>
              <h3>{currentContent.registerTitle}</h3>
              <p>{currentContent.registerDesc}</p>
              <Link to="/login" className="service-btn">Get Started</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🔐</div>
              <h3>{currentContent.loginTitle}</h3>
              <p>{currentContent.loginDesc}</p>
              <Link to="/login" className="service-btn">Sign In</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>{currentContent.statusTitle}</h3>
              <p>{currentContent.statusDesc}</p>
              <Link to="/check-status" className="service-btn">Check Status</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">💬</div>
              <h3>{currentContent.contactTitle}</h3>
              <p>{currentContent.contactDesc}</p>
              <a href="#contact" className="service-btn">Contact Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer" id="contact">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <p>📧 Email: info@kapurthala.gov.in</p>
              <p>📞 Phone: +91-1822-XXXXXX</p>
              <p>📍 Address: District Administrative Complex, Kapurthala, Punjab</p>
              <p>⏰ Office Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/login">Citizen Login</Link></li>
              <li><a href="#about">About Us</a></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Government Links</h3>
            <ul className="footer-links">
              <li><a href="https://punjab.gov.in" target="_blank" rel="noopener noreferrer">Punjab Government</a></li>
              <li><a href="https://india.gov.in" target="_blank" rel="noopener noreferrer">India Portal</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">RTI Portal</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">Grievance Portal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>{currentContent.footerText}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;