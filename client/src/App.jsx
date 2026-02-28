import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/register";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
