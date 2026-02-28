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
  Sun,
  Moon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../Auth/AuthContext";
import { useEncryptedData } from "../../hooks/useEncryptedData";
import { API_BASE_URL } from "../../config/api";
import toast from "react-hot-toast";
import "./Settings.css";

const USER_API_URL = `${API_BASE_URL}/api/user`;
const DATA_API_URL = `${API_BASE_URL}/api/data`;
const VALID_THEMES = ["light", "dark"];
const notificationMeta = {
  emailNotifications: {
    label: "Email notifications",
    description: "Receive account updates and monthly summaries by email.",
  },
  pushNotifications: {
    label: "Push notifications",
    description: "Get real-time alerts while using the app.",
  },
  budgetAlerts: {
    label: "Budget alerts",
    description: "Warn me when spending is close to budget limits.",
  },
  weeklyReports: {
    label: "Weekly reports",
    description: "Send a weekly snapshot of spending and savings.",
  },
  transactionAlerts: {
    label: "Transaction alerts",
    description: "Notify me whenever a new transaction is recorded.",
  },
};

const themeOptions = [
  {
    value: "light",
    label: "Light",
    description: "Bright, high-contrast workspace.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Reduced glare in low-light environments.",
    icon: Moon,
  },
];

export default function SettingsPage() {
  const { user, setUser, logout, getAuthHeader } = useAuth();
  const { data: transactions, refreshData: refreshTransactions } = useEncryptedData("transaction");
  const { data: budgets, refreshData: refreshBudgets } = useEncryptedData("budget");

  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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
      theme: VALID_THEMES.includes(user.preferences?.theme)
        ? user.preferences.theme
        : "light",
    });

    setNotifications((prev) => ({
      ...prev,
      ...(user.notifications || {}),
    }));
  }, [user]);

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      subtitle: "Identity and account details",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      subtitle: "Privacy and encrypted data tools",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      subtitle: "Control alerts and update frequency",
      icon: Bell,
    },
    {
      id: "preferences",
      label: "Preferences",
      subtitle: "Theme and experience settings",
      icon: Globe,
    },
  ];
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];

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
    const themeToSave = VALID_THEMES.includes(preferences.theme) ? preferences.theme : "light";

    if (themeToSave !== preferences.theme) {
      setPreferences((prev) => ({ ...prev, theme: themeToSave }));
    }

    await saveUserPreferences(
      {
        theme: themeToSave,
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

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmStep(1);
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    if (isDeletingAll) return;
    setDeleteConfirmStep(1);
    setShowDeleteConfirm(false);
  };

  const handleDeleteAllData = async () => {
    setIsDeletingAll(true);
    try {
      const [transactionDeleteRes, budgetDeleteRes] = await Promise.all([
        axios.delete(DATA_API_URL, {
          params: { dataType: "transaction" },
          headers: getAuthHeader(),
        }),
        axios.delete(DATA_API_URL, {
          params: { dataType: "budget" },
          headers: getAuthHeader(),
        }),
      ]);

      const deletedTransactions = Number(transactionDeleteRes.data?.deletedCount || 0);
      const deletedBudgets = Number(budgetDeleteRes.data?.deletedCount || 0);

      await Promise.all([refreshTransactions(), refreshBudgets()]);

      toast.success(`Deleted ${deletedTransactions} transactions and ${deletedBudgets} budgets`);
      setDeleteConfirmStep(1);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete data");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleChangePhoto = () => {
    toast("Photo upload is not available yet");
  };

  const toReadableLabel = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

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
      <div className="settings-shell">
        <header className="settings-header">  
          <h1>Settings</h1>
          <p className="settings-subtitle">
            Manage your profile, privacy controls, and app experience.
          </p>
        </header>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            <div className="settings-account">
              <div className="settings-avatar">{getInitials()}</div>
              <div className="settings-account-copy">
                <p className="settings-account-name">{profileData.fullName || "Unnamed User"}</p>
                <p className="settings-account-email">{profileData.email || "No email available"}</p>
              </div>
            </div>

            <nav className="settings-tab-list" aria-label="Settings sections">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className={activeTab === t.id ? "settings-tab active" : "settings-tab"}
                    onClick={() => setActiveTab(t.id)}
                    type="button"
                  >
                    <Icon size={18} />
                    <span className="settings-tab-copy">
                      <span className="settings-tab-label">{t.label}</span>
                      <span className="settings-tab-hint">{t.subtitle}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <button className="settings-btn-ghost settings-logout" onClick={logout} type="button">
              Logout
            </button>
          </aside>

          <main className="settings-content">
            <section className="settings-panel">
              <header className="settings-panel-head">
                <h2>{activeTabConfig.label}</h2>
                <p>{activeTabConfig.subtitle}</p>
              </header>

              {activeTab === "profile" && (
                <>
                  <div className="settings-profile-hero">
                    <div className="settings-avatar large">{getInitials()}</div>
                    <div>
                      <p className="settings-profile-name">{profileData.fullName || "Set your display name"}</p>
                      <p className="settings-profile-mail">{profileData.email || "No email available"}</p>
                    </div>
                    <button className="settings-btn-secondary" type="button" onClick={handleChangePhoto}>
                      <Camera size={16} /> Change photo
                    </button>
                  </div>

                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label htmlFor="fullName">Full name</label>
                      <input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        className="settings-input"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="age">Age</label>
                      <input
                        id="age"
                        type="number"
                        min="13"
                        max="120"
                        value={profileData.age}
                        onChange={(e) =>
                          setProfileData({ ...profileData, age: e.target.value })
                        }
                        className="settings-input"
                        placeholder="Age"
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="bio">Bio</label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({ ...profileData, bio: e.target.value })
                        }
                        className="settings-input settings-textarea"
                        placeholder="Tell us a little about yourself"
                      />
                    </div>

                    <div className="form-group form-group-full">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="settings-input is-readonly"
                      />
                    </div>
                  </div>

                  <div className="settings-actions">
                    <button
                      className="settings-btn-primary"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      type="button"
                    >
                      <Save size={16} /> {isSaving ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <div className="settings-security-note">
                    <Lock size={16} />
                    End-to-end encryption is active for your budgets and transactions.
                  </div>

                  <div className="settings-stats">
                    <div className="settings-stat-card">
                      <p className="settings-stat-label">Transactions</p>
                      <p className="settings-stat-value">{transactions.length}</p>
                    </div>
                    <div className="settings-stat-card">
                      <p className="settings-stat-label">Budgets</p>
                      <p className="settings-stat-value">{budgets.length}</p>
                    </div>
                  </div>

                  <div className="settings-row">
                    <div>
                      <h3>Export encrypted backup</h3>
                      <p>Download a JSON file with your encrypted app data.</p>
                    </div>
                    <button className="settings-btn-secondary" onClick={handleExportData} type="button">
                      <Download size={16} /> Export data
                    </button>
                  </div>

                  <div className="danger-zone">
                    <h3>Danger zone</h3>
                    <p>Delete all saved budgets and transactions permanently.</p>
                    <button
                      className="settings-btn-danger"
                      onClick={handleOpenDeleteConfirm}
                      type="button"
                    >
                      <Trash2 size={16} /> Delete all data
                    </button>
                  </div>
                </>
              )}

              {activeTab === "notifications" && (
                <>
                  {Object.keys(notifications).map((key) => {
                    const config = notificationMeta[key] || {
                      label: toReadableLabel(key),
                      description: "Toggle this notification setting.",
                    };

                    return (
                      <div className="settings-notification-row" key={key}>
                        <div className="settings-notification-copy">
                          <p className="settings-notification-title">{config.label}</p>
                          <p className="settings-notification-description">{config.description}</p>
                        </div>

                        <label className="settings-switch">
                          <input
                            type="checkbox"
                            checked={Boolean(notifications[key])}
                            onChange={() => handleToggle(key)}
                            aria-label={config.label}
                          />
                          <span className="settings-slider"></span>
                        </label>
                      </div>
                    );
                  })}

                  <div className="settings-actions">
                    <button
                      className="settings-btn-primary"
                      onClick={handleSaveNotifications}
                      disabled={isSaving}
                      type="button"
                    >
                      <Save size={16} /> {isSaving ? "Saving..." : "Save notifications"}
                    </button>
                  </div>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  <div className="settings-theme-grid">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = preferences.theme === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={isActive ? "settings-theme-card active" : "settings-theme-card"}
                          onClick={() =>
                            setPreferences({ ...preferences, theme: option.value })
                          }
                        >
                          <div className="settings-theme-head">
                            <Icon size={18} />
                            <span>{option.label}</span>
                          </div>
                          <p>{option.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="settings-actions">
                    <button
                      className="settings-btn-primary"
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      type="button"
                    >
                      <Save size={16} /> {isSaving ? "Saving..." : "Save preferences"}
                    </button>
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="settings-modal">
            {deleteConfirmStep === 1 ? (
              <>
                <h2>Delete all budgets and transactions?</h2>
                <p>This will remove all saved budget and transaction records from your account.</p>
                <div className="modal-actions">
                  <button
                    className="settings-btn-secondary"
                    onClick={handleCloseDeleteConfirm}
                    type="button"
                    disabled={isDeletingAll}
                  >
                    Cancel
                  </button>
                  <button
                    className="settings-btn-danger"
                    onClick={() => setDeleteConfirmStep(2)}
                    type="button"
                    disabled={isDeletingAll}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Final confirmation</h2>
                <p>This action is permanent and cannot be undone.</p>
                <div className="modal-actions">
                  <button
                    className="settings-btn-secondary"
                    onClick={() => setDeleteConfirmStep(1)}
                    type="button"
                    disabled={isDeletingAll}
                  >
                    Back
                  </button>
                  <button
                    className="settings-btn-danger"
                    onClick={handleDeleteAllData}
                    type="button"
                    disabled={isDeletingAll}
                  >
                    {isDeletingAll ? "Deleting..." : "Delete Everything"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
