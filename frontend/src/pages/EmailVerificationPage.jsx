import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./AuthPage.css";

const EmailVerificationPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const res = await fetch("http://localhost:4400/api/users/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, code }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Something went wrong. Make sure backend is running.");
    }
  };

  return (
    <div className="verification-page">
      <div className="verification-container">
        <h2>Verify Your Email</h2>
        <form onSubmit={handleVerify} className="verification-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{ marginTop: "10px" }}
          />
          <button type="submit">Verify Email</button>
        </form>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}

        <p className="footer-link">
          Already verified? <Link to="/login">Go to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
