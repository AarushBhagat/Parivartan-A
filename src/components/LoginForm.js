import React, { useState, useEffect } from 'react';
import './LoginForm.css';

const LoginForm = ({ userType, onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    department: '',
    captcha: ''
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [mathCaptcha, setMathCaptcha] = useState({ question: '', answer: 0 });

  // Generate a simple math captcha
  const generateMathCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const question = `${num1} + ${num2} = ?`;
    const answer = num1 + num2;
    setMathCaptcha({ question, answer });
  };

  useEffect(() => {
    generateMathCaptcha();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate captcha
    if (parseInt(formData.captcha) !== mathCaptcha.answer) {
      alert('Captcha validation failed. Please try again.');
      generateMathCaptcha();
      setFormData({ ...formData, captcha: '' });
      return;
    }

    // Submit form
    onLogin(formData);
  };

  const handleForgotPassword = () => {
    if (!forgotPasswordEmail) {
      alert('Please enter your email address.');
      return;
    }
    
    // Here you would typically call your password reset service
    alert(`Password reset instructions sent to: ${forgotPasswordEmail}`);
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
  };

  const getUserTypeTitle = () => {
    switch(userType) {
      case 'admin': return 'Admin Login';
      case 'staff': return 'Staff Login';
      case 'department': return 'Department Login';
      default: return 'Login';
    }
  };

  return (
    <div className="login-form">
      <div className="form-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2>{getUserTypeTitle()}</h2>
      </div>

      {!showForgotPassword ? (
        <>
          {/* Development credentials hint */}
          <div className="dev-credentials-hint">
            {userType === 'admin' && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Admin Credentials:</strong><br />
                <small>Email: <code>admin@parivartan.gov.in</code> | Password: <code>admin123</code></small>
              </div>
            )}
            {userType === 'staff' && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Staff Credentials:</strong><br />
                <small>Email: <code>staff@parivartan.gov.in</code> | Password: <code>staff123</code></small>
              </div>
            )}
            {userType === 'department' && (
              <div style={{ marginBottom: '10px' }}>
                <strong>🏢 Department Credentials (All use password: dept123):</strong><br />
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  fontSize: '11px', 
                  lineHeight: '1.6',
                  padding: '8px',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}>
                  <div><strong>PWD:</strong> pwd@parivartan.gov.in</div>
                  <div><strong>Municipal:</strong> municipal@parivartan.gov.in</div>
                  <div><strong>Traffic Police:</strong> traffic-police@parivartan.gov.in</div>
                  <div><strong>Water & Sanitation:</strong> water-sanitation@parivartan.gov.in</div>
                  <div><strong>PSPCL:</strong> pspcl@parivartan.gov.in</div>
                  <div><strong>Health & Welfare:</strong> health-welfare@parivartan.gov.in</div>
                  <div><strong>Civil Surgeon:</strong> civil-surgeon@parivartan.gov.in</div>
                  <div><strong>Punjab Police:</strong> punjab-police@parivartan.gov.in</div>
                  <div><strong>Education:</strong> education@parivartan.gov.in</div>
                  <div><strong>Agriculture:</strong> agriculture@parivartan.gov.in</div>
                  <div><strong>Food & Civil Supplies:</strong> food-civil-supplies@parivartan.gov.in</div>
                  <div><strong>Roadways:</strong> roadways@parivartan.gov.in</div>
                  <div><strong>RTO:</strong> rto@parivartan.gov.in</div>
                  <div><strong>Revenue:</strong> revenue@parivartan.gov.in</div>
                  <div><strong>Social Security:</strong> social-security@parivartan.gov.in</div>
                  <div><strong>Pollution Control:</strong> pollution-control@parivartan.gov.in</div>
                  <div><strong>Forest:</strong> forest@parivartan.gov.in</div>
                  <div><strong>Disaster Management:</strong> disaster-management@parivartan.gov.in</div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Email Address:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
              />
            </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {userType === 'department' && (
            <div className="form-group">
              <label htmlFor="department">Department:</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="pwd">Public Works Department (PWD)</option>
                <option value="municipal">Municipal Corporation / Nagar Council / Nagar Panchayat</option>
                <option value="traffic-police">Traffic Police</option>
                <option value="water-sanitation">Water Supply & Sanitation Department</option>
                <option value="pspcl">Punjab State Power Corporation Limited (PSPCL)</option>
                <option value="health-welfare">Health & Family Welfare Department</option>
                <option value="civil-surgeon">Civil Surgeon's Office</option>
                <option value="punjab-police">Punjab Police (SSP, Kapurthala)</option>
                <option value="education">District Education Officer (DEO) – School Education Department</option>
                <option value="agriculture">Agriculture & Farmers' Welfare Department</option>
                <option value="food-civil-supplies">Food & Civil Supplies Department</option>
                <option value="roadways">Punjab Roadways / PRTC</option>
                <option value="rto">Regional Transport Office (RTO)</option>
                <option value="revenue">Revenue Department (under Deputy Commissioner)</option>
                <option value="social-security">Social Security & Women & Child Development</option>
                <option value="pollution-control">Punjab Pollution Control Board (PPCB)</option>
                <option value="forest">Forest Department</option>
                <option value="disaster-management">District Disaster Management Authority (DDMA)</option>
              </select>
            </div>
          )}

          <div className="form-group captcha-group">
            <label>Security Verification</label>
            <div className="captcha-container">
              <div className="captcha-display">
                <div className="captcha-question">{mathCaptcha.question}</div>
                <button 
                  type="button" 
                  onClick={generateMathCaptcha}
                  className="refresh-captcha"
                  title="Generate new captcha"
                >
                  🔄
                </button>
              </div>
              <input
                type="text"
                name="captcha"
                value={formData.captcha}
                onChange={handleInputChange}
                placeholder="Enter your answer"
                required
                className="captcha-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="login-button">
              Login
            </button>
            <button 
              type="button" 
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>

          <div className="google-signin-section">
            <div className="divider">
              <span>OR</span>
            </div>
            <button 
              type="button" 
              className="google-signin-button"
              onClick={() => alert('Google Sign-In functionality will be implemented')}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </form>
        </>
      ) : (
        <div className="forgot-password-form">
          <h3>Reset Password</h3>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="reset-button"
              onClick={handleForgotPassword}
            >
              Send Reset Instructions
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setShowForgotPassword(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;