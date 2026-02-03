import { useState } from "react";
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
import "./Settings.css";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    location: "Mumbai, Maharashtra, IN",
    bio: "Finance enthusiast and budget tracker",
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
            <div className="avatar">JD</div>
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
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              value={profileData.phone}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              value={profileData.location}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="form-input"
            />
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
            />
          </div>

          <button className="primary-btn">
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
              placeholder="Enter current password"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
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
                  <span className="notification-text">{key}</span>

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
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Theme
                </label>
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
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>

              <button className="primary-btn">
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
