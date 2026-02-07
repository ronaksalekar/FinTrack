import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Globe,
  Moon,
  Trash2,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Shield,
} from "lucide-react";
import { useAuth } from "../Auth/AuthContext";
import "./Settings.css";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Load user preferences from localStorage on mount
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    age: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    budgetAlerts: true,
    weeklyReports: false,
    transactionAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    currency: "USD",
    language: "en",
    theme: "light",
    dateFormat: "MM/DD/YYYY",
  });

  // Load data on component mount
  useEffect(() => {
    // Get user preferences from welcome page
    const savedPreferences = localStorage.getItem('userPreferences');
    
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      setProfileData({
        fullName: prefs.fullName || "",
        email: user?.email || "",
        phone: "",
        location: "",
        bio: "",
        age: prefs.age || "",
      });
      
      // Update theme preference if set
      if (prefs.theme) {
        setPreferences(prev => ({
          ...prev,
          theme: prefs.theme
        }));
      }
    } else if (user) {
      // If no preferences saved, use user data from auth
      setProfileData(prev => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveProfile = () => {
    // Update localStorage with new profile data
    const currentPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    const updatedPrefs = {
      ...currentPrefs,
      fullName: profileData.fullName,
      age: profileData.age,
    };
    localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
    alert('Profile updated successfully!');
  };

  const handleSavePreferences = () => {
    const currentPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    const updatedPrefs = {
      ...currentPrefs,
      theme: preferences.theme,
    };
    localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
    alert('Preferences saved successfully!');
  };

  const getInitials = () => {
    if (profileData.fullName) {
      const names = profileData.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        <aside className="settings-sidebar">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={activeTab === t.id ? "tab active" : "tab"}
                onClick={() => setActiveTab(t.id)}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </aside>

        <main className="settings-content">
          {activeTab === "profile" && (
            <div className="card">
              <h2 className="card-title">Profile Information</h2>

              <div className="avatar-row">
                <div className="avatar">{getInitials()}</div>
                <button className="primary-btn">
                  <Camera size={16} />
                  Change Photo
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Enter your age"
                  min="13"
                  max="120"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="your@email.com"
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Email cannot be changed
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  rows="4"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  className="form-textarea"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button className="primary-btn" onClick={handleSaveProfile}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="card">
              <h2 className="card-title">Security</h2>

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Re-enter new password"
                  className="form-input"
                />
              </div>

              <button className="primary-btn">
                <Lock size={16} />
                Update Password
              </button>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Once you delete your account, there is no going back.</p>
                <button className="danger-btn">
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card">
              <h2>Notifications</h2>

              {Object.keys(notifications).map((key) => (
                <div className="notification-card" key={key}>
                  <div>
                    <span className="notification-text">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'pushNotifications' && 'Receive push notifications'}
                      {key === 'budgetAlerts' && 'Get alerts when approaching budget limits'}
                      {key === 'weeklyReports' && 'Receive weekly spending reports'}
                      {key === 'transactionAlerts' && 'Get notified of new transactions'}
                    </p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={() => handleToggle(key)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}

              <button className="primary-btn">
                <Save size={16} />
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="card">
              <h2>Preferences</h2>
              
              <div className="form-group">
                <label className="form-label">Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      theme: e.target.value,
                    }))
                  }
                  className="theme-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>


              <button className="primary-btn" onClick={handleSavePreferences}>
                <Save size={16} />
                Save Preferences
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}