import { useState } from "react";
import LoginModal from "../component/modals/loginModal";
import RegisterModal from "../component/modals/registerModal";

export default function App() {
  const [modal, setModal] = useState("login");

  return (
    <>
      {modal === "login" && (
        <LoginModal
          onClose={() => {
            setModal(null);
            window.location.href = "/";
          }}
          onSwitchToRegister={() => setModal("register")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => {
            setModal(null);
            window.location.href = "/";
          }}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </>
  );
}
