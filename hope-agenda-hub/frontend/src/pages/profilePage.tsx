import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:4400/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data); // Set the user data
        } else {
          alert(data.message || "Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        alert("Something went wrong while fetching profile.");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <main style={{ padding: "100px 20px 20px" }}>
        <h1>Profile</h1>
        <div
          style={{
            maxWidth: "500px",
            margin: "20px auto",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
          }}
        >
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleLogout}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#4caf50",
                color: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
            <Link
              to="/addagenda"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2196f3",
                color: "white",
                textDecoration: "none",
              }}
            >
              My Notes
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
