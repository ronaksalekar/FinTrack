import React, { useEffect, useMemo, useState } from "react";
import { FiMenu, FiX, FiHome, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext";
import UserDropdown from "./UserDropdown";
import "./Navbar.css";

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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const profileInitials = useMemo(
    () => getInitials(user?.profile?.fullName, user?.email),
    [user?.email, user?.profile?.fullName]
  );

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
    setOpen(false);
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50">
      <div className="navbar-container">
        <button className="navbar-brand navbar-brand-btn" onClick={() => handleNavigate("/dashboard")} type="button">
          FinTrack
        </button>

        <button className="navbar-toggle" onClick={toggleMobileMenu} type="button" aria-label="Toggle menu">
          {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <ul className={mobileMenuOpen ? "navbar-items active" : "navbar-items"}>
          <li className="nav-item">
            <button className="nav-link nav-link-btn" onClick={() => handleNavigate("/dashboard")} type="button">
              <FiHome size={20} />
              <span className="nav-link-label">Home</span>
              <span className="tooltip">Home</span>
            </button>
          </li>

          <li className="nav-item nav-item-profile">
            <button
              className="nav-link nav-link-btn nav-profile-btn"
              onClick={toggleUserDropdown}
              type="button"
              aria-expanded={open}
            >
              <span className="profile-trigger-avatar">{profileInitials}</span>
              <span className="profile-trigger-name">{displayName}</span>
              <FiChevronDown className={open ? "profile-trigger-caret open" : "profile-trigger-caret"} size={16} />
            </button>
            {open && <UserDropdown onClose={() => setOpen(false)} />}
          </li>
        </ul>
      </div>
    </nav>
  );
}
