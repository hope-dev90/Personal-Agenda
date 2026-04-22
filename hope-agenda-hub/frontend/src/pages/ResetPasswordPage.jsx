import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AuthPage.css"; // use your existing CSS
import { apiUrl } from "../config/api";

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email;
  const [email] = useState(emailFromState || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!emailFromState) {
      alert("Please enter your email first");
      navigate("/forgot-password");
    }
  }, [emailFromState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl("/api/users/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message || "Error resetting password");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while contacting the server.");
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        background: "linear-gradient(to right, #f5f0ff, #ffe6f0)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div className="auth-container" style={{ maxWidth: "400px", width: "100%", padding: "30px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", background: "#fff" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#46022f" }}>Reset Password</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Verification Code
            <input
              type="text"
              placeholder="Enter code from email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" className="btn-primary" style={{ marginTop: "20px" }}>
            Reset Password
          </button>

          <p className="auth-footer" style={{ marginTop: "15px", textAlign: "center" }}>
            Remembered password? <span onClick={() => navigate("/login")} style={{ color: "#46022f", cursor: "pointer" }}>Login here</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
