import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginBg from "../assets/login-bg.png";
import "./AuthPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4400/api/users/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        setEmail("");
        setPassword("");
        navigate("/addagenda");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Check backend is running.");
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        background:"linear-gradient(to right, #a97b53, #cf9310)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
       
        alignItems: "center",
      }}
    >
      <div className="back-home-container">
        <Link to="/" className="back-home-btn">
          ⬅ Back Home
        </Link>
      </div>

      <div className="auth-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit" className="btn-primary">
            Login
          </button>

          {/* 👇 Forgot Password Link */}
          <p className="auth-footer">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </p>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup" className="signup">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;