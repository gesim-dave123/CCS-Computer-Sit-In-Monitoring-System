import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
