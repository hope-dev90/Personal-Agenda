// App.jsx
import { Routes, Route } from "react-router-dom"; // <-- only import Routes & Route

import LandingPage from "./pages/LandingPage";
import AddAgendaPage from "./pages/AddAgendaPage";
import LoginPage from "./pages/LoginPage"; 
import SignupPage from "./pages/SignupPage"; 
function App() {
  return (
    <>
      

      <Routes>
        <Route path="/" element={<LandingPage />} />
           <Route path="/login" element={<LoginPage />} />
        <Route path="/addagenda" element={<AddAgendaPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </>
  );
}

export default App;
