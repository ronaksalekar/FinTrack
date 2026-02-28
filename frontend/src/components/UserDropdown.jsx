import React, { useMemo } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";
import "./UserDropdown.css";

const getDisplayName = (user) => {
  if (user?.profile?.fullName) return user.profile.fullName;
  if (user?.email) return user.email.split("@")[0];
  return "User";
};

const getInitials = (name, email) => {
  const source = name || email || "User";
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

export default function UserDropdown({ onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const email = user?.email || "No email";
  const initials = useMemo(() => getInitials(user?.profile?.fullName, user?.email), [user?.email, user?.profile?.fullName]);

  const handleOpenSettings = () => {
    navigate("/settings");
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  return (
    <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-copy">
          <p className="profile-name">{displayName}</p>
          <p className="profile-email">{email}</p>
        </div>
      </div>

      <div className="profile-divider" />

      <button className="profile-action-btn" onClick={handleOpenSettings} type="button">
        <FiSettings size={16} /> Account Settings
      </button>

      <button className="profile-action-btn logout-btn" onClick={handleLogout} type="button">
        <FiLogOut size={16} /> Logout
      </button>
    </div>
  );
}
