import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import { apiUrl } from "../config/api";
import { getErrorMessage, readApiResponse } from "../utils/apiResponse";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(apiUrl("/api/users/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await readApiResponse(res);

      if (res.ok) {
        setMessage(
          "Signup successful! Please check your email to verify your account."
        );

        clearForm();

        // Wait 2 seconds then redirect
        setTimeout(() => {
          navigate("/verify-email");
        }, 2000);
      } else {
        setError(getErrorMessage(res, data, "Signup failed"));
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong while contacting the server.");
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
              autoComplete="name"
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
              autoComplete="email"
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
              autoComplete="new-password"
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
