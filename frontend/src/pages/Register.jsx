import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
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
      await API.post("/auth/register", form);
      alert("Registration Successful! Please log in.");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  const isFormValid = form.name.trim() && form.email.trim() && form.password.trim();

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-logo">connect</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="auth-input"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
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
            Sign up
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line"></div>
        </div>
      </div>

      <div className="auth-switch-card">
        <span>Have an account?</span>
        <Link to="/" className="auth-link">
          Log in
        </Link>
      </div>
    </div>
  );
}

export default Register;