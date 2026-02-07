import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Moon, Sun, ArrowRight, Check, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from 'C:/Notes/Projects/Project-1/finance_tracker/frontend/src/components/Auth/AuthContext.jsx'
import './WelcomePage.css';

const API_URL = 'http://localhost:5000/api/user';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    theme: 'light'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill user's name from signup
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.profile?.fullName || user.name || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleThemeSelect = (theme) => {
    setFormData({
      ...formData,
      theme: theme
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.age) {
        alert('Please fill in all fields');
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/preferences`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="welcome-overlay">
      <div className="welcome-backdrop" onClick={handleSkip}></div>
      
      <div className="welcome-modal">
        <button className="welcome-skip-btn" onClick={handleSkip} title="Skip onboarding" aria-label="Skip onboarding">
          <X size={20} />
        </button>

        <div className="welcome-progress">
          <div className="welcome-progress-steps">
            {[1, 2, 3].map((num) => (
              <div key={num} className="welcome-progress-wrapper">
                <div className={`welcome-progress-circle ${step >= num ? 'active' : ''}`}>
                  {step > num ? <Check size={18} /> : num}
                </div>
                {num < 3 && (
                  <div className={`welcome-progress-line ${step > num ? 'active' : ''}`} />
                )}
              </div>
            ))}
          </div>
          <div className="welcome-progress-labels">
            <span className={step === 1 ? 'active' : ''}>Personal Info</span>
            <span className={step === 2 ? 'active' : ''}>Preferences</span>
            <span className={step === 3 ? 'active' : ''}>About</span>
          </div>
        </div>

        <div className="welcome-content">
          {step === 1 && (
            <div className="welcome-step">
              <div className="welcome-header">
                <div className="welcome-icon-circle">
                  <User size={28} />
                </div>
                <h2>Welcome, {formData.fullName.split(' ')[0] || 'there'}! 🎉</h2>
                <p>Let's complete your profile</p>
              </div>

              <div className="welcome-form-group">
                <label htmlFor="welcome-fullname">Full Name</label>
                <div className="welcome-input-wrapper">
                  <User className="welcome-input-icon" size={18} aria-hidden="true" />
                  <input
                    id="welcome-fullname"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  You can update this if needed
                </small>
              </div>

              <div className="welcome-form-group">
                <label htmlFor="welcome-age">Age</label>
                <div className="welcome-input-wrapper">
                  <Calendar className="welcome-input-icon" size={18} aria-hidden="true" />
                  <input
                    id="welcome-age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    min="13"
                    max="120"
                  />
                </div>
              </div>

              <button onClick={handleNext} className="welcome-btn-primary">
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="welcome-step">
              <div className="welcome-header">
                <h2>Choose Your Theme</h2>
                <p>Pick a theme that suits your style</p>
              </div>

              <div className="welcome-theme-grid">
                <button
                  onClick={() => handleThemeSelect('light')}
                  className={`welcome-theme-card ${formData.theme === 'light' ? 'selected' : ''}`}
                  type="button"
                >
                  <div className="welcome-theme-icon light">
                    <Sun size={28} />
                  </div>
                  <h3>Light Mode</h3>
                  <p>Clean and bright</p>
                  {formData.theme === 'light' && (
                    <div className="welcome-check-icon">
                      <Check size={20} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeSelect('dark')}
                  className={`welcome-theme-card ${formData.theme === 'dark' ? 'selected' : ''}`}
                  type="button"
                >
                  <div className="welcome-theme-icon dark">
                    <Moon size={28} />
                  </div>
                  <h3>Dark Mode</h3>
                  <p>Easy on eyes</p>
                  {formData.theme === 'dark' && (
                    <div className="welcome-check-icon">
                      <Check size={20} />
                    </div>
                  )}
                </button>
              </div>

              <div className="welcome-button-group">
                <button onClick={() => setStep(1)} className="welcome-btn-secondary" type="button">
                  Back
                </button>
                <button onClick={handleNext} className="welcome-btn-primary" type="button">
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="welcome-step">
              <div className="welcome-header">
                <h2>About FinTrack 💰</h2>
                <p>Your personal finance companion</p>
              </div>

              <div className="welcome-features">
                <div className="welcome-feature blue">
                  <h3>📊 Track Expenses</h3>
                  <p>Monitor transactions and categorize spending.</p>
                </div>

                <div className="welcome-feature green">
                  <h3>🎯 Set Budgets</h3>
                  <p>Create budgets and get alerts on limits.</p>
                </div>

                <div className="welcome-feature purple">
                  <h3>📈 View Reports</h3>
                  <p>Visualize data with charts and insights.</p>
                </div>

                <div className="welcome-feature pink">
                  <h3>🔒 Secure & Private</h3>
                  <p>Your data is encrypted and secure.</p>
                </div>
              </div>

              <div className="welcome-button-group">
                <button onClick={() => setStep(2)} className="welcome-btn-secondary" type="button">
                  Back
                </button>
                <button 
                  onClick={handleComplete} 
                  className="welcome-btn-primary" 
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Get Started'}
                  <Check size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}