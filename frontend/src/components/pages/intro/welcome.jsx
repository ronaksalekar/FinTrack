import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Moon, Sun, ArrowRight, Check } from 'lucide-react';
import './WelcomePage.css';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    theme: 'light',
    bio: ''
  });

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

  const handleComplete = () => {
    // Save user preferences to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(formData));
    localStorage.setItem('onboardingComplete', 'true');
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-steps">
            {[1, 2, 3].map((num) => (
              <div key={num} className="progress-step-wrapper">
                <div className={`progress-circle ${step >= num ? 'active' : ''}`}>
                  {step > num ? <Check size={20} /> : num}
                </div>
                {num < 3 && (
                  <div className={`progress-line ${step > num ? 'active' : ''}`} />
                )}
              </div>
            ))}
          </div>
          <div className="progress-labels">
            <span className={step === 1 ? 'active-label' : ''}>Personal Info</span>
            <span className={step === 2 ? 'active-label' : ''}>Preferences</span>
            <span className={step === 3 ? 'active-label' : ''}>About the App</span>
          </div>
        </div>

        {/* Card */}
        <div className="welcome-card">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-header">
                <div className="icon-circle">
                  <User size={32} />
                </div>
                <h2>Welcome! 🎉</h2>
                <p>Let's get to know you better</p>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Age</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" size={20} />
                  <input
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

              <button onClick={handleNext} className="btn-primary">
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Theme Preference */}
          {step === 2 && (
            <div className="step-content">
              <div className="step-header">
                <h2>Choose Your Theme</h2>
                <p>Pick a theme that suits your style</p>
              </div>

              <div className="theme-grid">
                {/* Light Theme */}
                <button
                  onClick={() => handleThemeSelect('light')}
                  className={`theme-card ${formData.theme === 'light' ? 'selected' : ''}`}
                >
                  <div className="theme-icon light">
                    <Sun size={32} />
                  </div>
                  <h3>Light Mode</h3>
                  <p>Clean and bright interface</p>
                  {formData.theme === 'light' && (
                    <div className="check-icon">
                      <Check size={24} />
                    </div>
                  )}
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => handleThemeSelect('dark')}
                  className={`theme-card ${formData.theme === 'dark' ? 'selected' : ''}`}
                >
                  <div className="theme-icon dark">
                    <Moon size={32} />
                  </div>
                  <h3>Dark Mode</h3>
                  <p>Easy on the eyes</p>
                  {formData.theme === 'dark' && (
                    <div className="check-icon">
                      <Check size={24} />
                    </div>
                  )}
                </button>
              </div>

              <div className="button-group">
                <button onClick={() => setStep(1)} className="btn-secondary">
                  Back
                </button>
                <button onClick={handleNext} className="btn-primary">
                  Continue
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: About the App */}
          {step === 3 && (
            <div className="step-content">
              <div className="step-header">
                <h2>About FinTrack 💰</h2>
                <p>Your personal finance companion</p>
              </div>

              <div className="features-list">
                <div className="feature-card blue">
                  <h3>📊 Track Your Expenses</h3>
                  <p>
                    Monitor all your transactions in one place. Categorize spending and see where your money goes.
                  </p>
                </div>

                <div className="feature-card green">
                  <h3>🎯 Set Budgets</h3>
                  <p>
                    Create monthly budgets for different categories and get alerts when you're close to your limits.
                  </p>
                </div>

                <div className="feature-card purple">
                  <h3>📈 View Reports</h3>
                  <p>
                    Visualize your financial data with charts and graphs. Get insights on your spending patterns.
                  </p>
                </div>

                <div className="feature-card pink">
                  <h3>🔒 Secure & Private</h3>
                  <p>
                    Your financial data is encrypted and secure. We take your privacy seriously.
                  </p>
                </div>
              </div>

              <div className="button-group">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  Back
                </button>
                <button onClick={handleComplete} className="btn-primary">
                  Get Started
                  <Check size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="footer-text">© 2026 FinTrack. Your finances, simplified.</p>
      </div>
    </div>
  );
}