import React from "react";
import "./footer.css";
import { Github, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        
        {/* Left: Brand */}
        <div className="footer-brand">
          <span className="footer-icon">📖</span>
          <div>
            <h3>Agenda</h3>
            <p>Organize your thoughts, beautifully.</p>
            <small>© {new Date().getFullYear()} Agenda</small>
          </div>
        </div>

        {/* Right: Contact & Socials */}
        <div className="footer-links">
          <a href="https://github.com/hope-dev90" target="_blank" rel="noreferrer">
            <Github size={18} /> hope-dev90
          </a>

          <a href="https://linkedin.com/in/YOUR_PROFILE" target="_blank" rel="noreferrer">
            <Linkedin size={18} /> LinkedIn
          </a>

          <a href="mailto:mutimutujehope90@gmail.com">
            <Mail size={18} /> mutimutujehope90@gmail.com
          </a>

          <a href="tel:+250783494966">
            <Phone size={18} /> +250 783 49 966
          </a>
        </div>

      </div>
    </footer>
  );
}
