import React, { useState } from 'react';
import { api } from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'applicant',
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      console.log('Response:', res);
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister}>
      <h2>Register</h2>

        <input type="text" placeholder="Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <input type="email"  placeholder="Email"  onChange={(e) => setFormData({ ...formData, email: e.target.value })}  />
        <input type="password" placeholder="Password"  onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

        {/* Role selection */}
        <div className="role-selection">
          <label>
            <input type="radio" value="applicant" checked={formData.role === 'applicant'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            Applicant
          </label>
          <label>
            <input type="radio" value="company" checked={formData.role === 'company'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            Company
          </label>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
