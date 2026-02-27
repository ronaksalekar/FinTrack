import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Globe,
  Trash2,
  Save,
  Camera,
  Download,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../Auth/AuthContext";
import { useEncryptedData } from "../../hooks/useEncryptedData";
import { API_BASE_URL } from "../../config/api";
import toast from "react-hot-toast";
import "./Settings.css";

const USER_API_URL = `${API_BASE_URL}/api/user`;

export default function SettingsPage() {
  const { user, setUser, logout, getAuthHeader } = useAuth();
  const { data: transactions } = useEncryptedData("transaction");
  const { data: budgets } = useEncryptedData("budget");

  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    bio: "",
    age: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    budgetAlerts: true,
    weeklyReports: false,
    transactionAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
  });

  useEffect(() => {
    if (!user) return;

    setProfileData({
      fullName: user.profile?.fullName || "",
      email: user.email || "",
      bio: user.profile?.bio || "",
      age: user.profile?.age ?? "",
    });

    setPreferences({
      theme: user.preferences?.theme || "light",
    });

    setNotifications((prev) => ({
      ...prev,
      ...(user.notifications || {}),
    }));
  }, [user]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  const handleExportData = () => {
    const exportData = {
      user: { email: user?.email || "" },
      transactions,
      budgets,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    toast.success("Encrypted data exported");
  };

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveUserPreferences = async (payload, successMessage) => {
    setIsSaving(true);
    try {
      const res = await axios.put(`${USER_API_URL}/preferences`, payload, {
        headers: getAuthHeader(),
      });

      if (res.data?.user) {
        setUser(res.data.user);
      }

      toast.success(successMessage);
      return res.data?.user || null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    await saveUserPreferences(
      {
        fullName: profileData.fullName,
        age: profileData.age === "" ? "" : Number(profileData.age),
        bio: profileData.bio,
      },
      "Profile updated"
    );
  };

  const handleSavePreferences = async () => {
    await saveUserPreferences(
      {
        theme: preferences.theme,
      },
      "Preferences updated"
    );
  };

  const handleSaveNotifications = async () => {
    await saveUserPreferences(
      {
        notifications,
      },
      "Notifications updated"
    );
  };

  const handleDeleteAllData = () => {
    toast.error("Bulk delete endpoint is not implemented");
    setShowDeleteConfirm(false);
  };

  const getInitials = () => {
    if (!profileData.fullName) return "U";
    return profileData.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage account, privacy and preferences</p>
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
                <button className="primary-btn" type="button">
                  <Camera size={16} /> Change Photo
                </button>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={profileData.age}
                  onChange={(e) =>
                    setProfileData({ ...profileData, age: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  value={profileData.email}
                  disabled
                  className="form-input"
                  style={{ opacity: 0.6 }}
                />
              </div>

              <button
                className="primary-btn"
                onClick={handleSaveProfile}
                disabled={isSaving}
                type="button"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="card">
              <h2>Privacy and Security</h2>

              <p className="encryption-status">End-to-end encryption active</p>

              <div className="setting-item">
                <h4>Export Encrypted Data</h4>
                <button className="secondary-btn" onClick={handleExportData}>
                  <Download size={16} /> Export Data
                </button>
              </div>

              <div className="setting-item">
                <p>
                  You have {transactions.length} transactions and {budgets.length} budgets
                </p>
              </div>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <button
                  className="danger-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} /> Delete All Data
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

              <button
                className="primary-btn"
                onClick={handleSaveNotifications}
                disabled={isSaving}
                type="button"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Notifications"}
              </button>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="card">
              <h2>Preferences</h2>

              <div className="form-group">
                <label>Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) =>
                    setPreferences({ ...preferences, theme: e.target.value })
                  }
                  className="theme-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <button
                className="primary-btn"
                onClick={handleSavePreferences}
                disabled={isSaving}
                type="button"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Preferences"}
              </button>

              <button className="btn-logout" onClick={logout} type="button">
                Logout
              </button>
            </div>
          )}
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete all data?</h2>
            <p>This cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button className="danger-btn" onClick={handleDeleteAllData} type="button">
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
