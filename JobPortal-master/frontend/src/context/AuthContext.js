import { createContext, useState,useEffect } from 'react';
import { setAuthToken } from '../api';

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');

    if (token) {
      setAuthToken(token);
      setAuth({ token, role });
    }
    setLoading(false); // Set loading to false after checking localStorage
  }, []);

  if (loading) return <div>Loading...</div>; // Show loading message while loading

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};
