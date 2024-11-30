import React from "react";
import { useNavigate } from "react-router-dom";
import './Home.css'
const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    navigate("/login");
  };

  return (
    <div className="home-container">
    <div className="content">
      <h1>Next Step Workforce Solution</h1>
      <p>Empowering Your Next Career Move</p>
      <button onClick={handleLoginClick}>Job Seeker</button>
      <button onClick={handleRegisterClick}>Employer</button>
    </div>
  </div>
  );
};

export default Home;
