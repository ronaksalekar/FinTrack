import React, { useState, useEffect } from "react";
import { FiUser, FiSettings, FiMenu, FiX, FiHome } from "react-icons/fi";
import UserDropdown from "./UserDropdown";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const navigate = useNavigate();
  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="navbar-container">
        {/* Brand */}
        <button className="navbar-brand navbar-brand-btn" onClick={() => navigate("/dashboard")} type="button">
          FinTrack
        </button>

        {/* Mobile Toggle */}
        <button className="navbar-toggle" onClick={toggleMobileMenu} type="button">
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Navbar items */}
        <ul className={`navbar-items ${mobileMenuOpen ? "active" : ""}`}>

           <li className="nav-item">
            <button className="nav-link nav-link-btn" onClick={() => navigate("/dashboard")} type="button">
              <FiHome size={22} />
              <span className="tooltip" >Home</span>
            </button>
          </li>
          {/* USER ICON */}
          <li className="nav-item">
            <button className="nav-link nav-link-btn" onClick={toggleUserDropdown} type="button">
              <FiUser size={22} />
               <span className="tooltip">Profile</span>
            </button>
            {open && <UserDropdown />}
          </li>
          {/* Settings */}
          <li className="nav-item">
            <button className="nav-link nav-link-btn" onClick={() => navigate("/settings")} type="button">
              <FiSettings size={22} />
              <span className="tooltip">Settings</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
