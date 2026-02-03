import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';
import "./UserDropdown.css";

export default function UserDropdown() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = (e) => {
    e.preventDefault();
    console.log("Logout clicked");
    logout();
    navigate('/login');
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
        <span className="profile-name">{user?.name || 'John Doe'}</span>
      </div>

      <div className="profile-divider" />

      {/* Logout */}
      <a href="#" className="logout-btn" onClick={handleLogout}>
        <FiLogOut /> Logout
      </a>
    </div>
  );
}