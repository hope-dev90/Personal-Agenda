import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupBg from "../assets/login-bg.png";
import "./AuthPage.css";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

 const handleSignup = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");

  try {
    const res = await fetch("http://localhost:4400/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Signup successful! Redirecting...");
      setName(""); setEmail(""); setPassword("");
    }

  
    setTimeout(() => navigate("/verify-email"), 2000);

  } catch (err) {
    console.error("Signup error:", err);
    setError("Something went wrong. Make sure backend is running.");
  
    setTimeout(() => navigate("/verify-email"), 2000);
  }
};

  return (
    <div
      className="auth-page"
      style={{
        background:"linear-gradient(to right, #fae19c, #a06f25)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="auth-container">
        <h1>Create Account</h1>

        <form onSubmit={handleSignup} className="auth-form">
          <label>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </label>

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
              minLength="6"
            />
          </label>

          <button type="submit" className="btn-primary">
            Sign Up
          </button>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="signup">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;