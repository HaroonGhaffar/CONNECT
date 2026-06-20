import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  const isFormValid = form.email.trim() && form.password.trim();

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-logo">connect</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="auth-input"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="auth-input"
            required
          />

          <button
            type="submit"
            className="auth-btn"
            disabled={!isFormValid}
          >
            Log in
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line"></div>
        </div>
      </div>

      <div className="auth-switch-card">
        <span>Don't have an account?</span>
        <Link to="/register" className="auth-link">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default Login;