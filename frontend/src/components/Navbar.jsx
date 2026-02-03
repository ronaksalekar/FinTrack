import React, { useState, useEffect } from "react";
import { FiUser, FiBell, FiSettings, FiMenu, FiX, FiHome } from "react-icons/fi";
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
        <a className="navbar-brand" href="#" onClick={() => navigate('/dashboard')}>
          FinTrack
        </a>

        {/* Mobile Toggle */}
        <button className="navbar-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Navbar items */}
        <ul className={`navbar-items ${mobileMenuOpen ? "active" : ""}`}>

           <li className="nav-item">
            <a className="nav-link" href="#">
              <FiHome size={22} onClick={() => navigate('/dashboard')}/>
              <span className="tooltip" >Home</span>
            </a>
          </li>
          {/* USER ICON */}
          <li className="nav-item">
            <span className="nav-link" onClick={toggleUserDropdown}>
              <FiUser size={22} />
               <span className="tooltip">Profile</span>
            </span>
            {open && <UserDropdown />}
          </li>
          {/* Settings */}
          <li className="nav-item">
            <a className="nav-link" href="#">
              <FiSettings size={22} onClick={() => navigate('/settings')} />
              <span className="tooltip">Settings</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}