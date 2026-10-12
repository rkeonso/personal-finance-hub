import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, fetchTransactions } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if session cookie is valid on initial app mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Attempt a light authenticated request
        await fetchTransactions();
        setUser({ authenticated: true });
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data);
    return data;
  };

  const register = async (email, password) => {
    const data = await registerUser(email, password);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);