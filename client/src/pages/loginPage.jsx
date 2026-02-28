import { useState } from "react";
import LoginModal from "../component/modals/loginModal";
import RegisterModal from "../component/modals/registerModal";
import { useNavigate } from "react-router-dom";
import csslogo from "../assets/image/ccslogo.png";

export default function LoginPage() {
  const [modal, setModal] = useState("login");
  const navigate = useNavigate();

  return (
    <>
      <img
            src={csslogo}
            alt=""
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
            style={{ width: 1040, height: 1040, opacity: 0.4, zIndex: 0 }}
          />
        <LoginModal
          onClose={() => {
            setModal(null);
            navigate("/");
          }}
          onSwitchToRegister={() => setModal("register")}
        />
    </>
  );
}
