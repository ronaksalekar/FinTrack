import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";
import "./UserDropdown.css";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
      {/* Profile section */}
      <div className="profile-header">
        <img
          src="/istockphoto-1337144146-612x612.jpg"
          alt="User"
          className="profile-avatar"
        />
        <span className="profile-name">
          {user?.profile?.fullName || user?.email || "User"}
        </span>
      </div>

      <div className="profile-divider" />

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout} type="button">
        <FiLogOut /> Logout
      </button>
    </div>
  );
}
