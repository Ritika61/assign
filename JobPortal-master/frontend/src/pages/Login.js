import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api, setAuthToken } from "../api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", formData);
      console.log("reslogin", response);
      setAuth({ token: response.data.token, role: response.data.role });
      setAuthToken(response.data.token);
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("role", response.data.role);

      navigate(response.data.role === "company" ? "/company-dashboard" : "/applicant-dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
