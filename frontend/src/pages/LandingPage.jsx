
import Footer from "../components/Footer";
import "./landing.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Calendar, Pencil, Clock, CheckCircle } from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login"); // Redirect to login page
  };

  const features = [
    {
      icon: Pencil,
      title: "Quick Notes",
      description:
        "Jot down thoughts instantly. No friction, no distractions—just you and your ideas.",
    },
    {
      icon: Calendar,
      title: "Daily Planning",
      description:
        "Organize your day with elegant simplicity. See what matters at a glance.",
    },
    {
      icon: Clock,
      title: "Time Blocks",
      description:
        "Schedule focused work sessions and protect your most productive hours.",
    },
    {
      icon: CheckCircle,
      title: "Task Tracking",
      description:
        "Check off completed items with satisfaction. Watch your progress unfold.",
    },
  ];

  return (
    <div className="text-bg-light p-3">
    <Navbar/>

      <div className="notesbox">
        <p>✨ Your thoughts, beautifully organized</p>
      </div>

      <div className="bigtext">
        <h1 className="h1">Write freely.</h1>
        <h1 className="noteh2">Think cleanly.</h1>
      </div>

      <p className="paragraph">
        A minimalist agenda designed for those who value simplicity. Capture
        your thoughts, plan your days, and stay focused on what matters.
      </p>

      <div className="button-group">
        <button type="button" className="success" onClick={handleGetStarted}>
          Start Writing ⭢
        </button>
        <button type="button" className="white">
          See How It Works
        </button>
      </div>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="focus">
              Designed with intention. Every feature exists to help you focus, not distract.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="feature-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="feature-icon">
                    <FeatureIcon className="icon" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="ready text-center mt-16">
            <h1 className="readyh1">Ready to write your story?</h1>
            <p className="readyp">
              Join thousands who have discovered joy through planning. Plan your
              journey and write exciting things you see.
            </p>
            <button className="get-started-btn" onClick={handleGetStarted}>
              Get Started 🡒
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
