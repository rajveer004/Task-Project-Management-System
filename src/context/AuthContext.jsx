import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setApiToken } from '../lib/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('subpilot_auth_token'));
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      setAllUsers(res.users || []);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const initAuth = async () => {
    setLoading(true);
    try {
      await fetchUsers();
      if (token) {
        setApiToken(token);
        const meRes = await api.getMe();
        if (meRes && meRes.user) {
          setCurrentUser(meRes.user);
        } else {
          // Token stale, auto login default
          const loginRes = await api.login('user_admin_1');
          setToken(loginRes.token);
          setApiToken(loginRes.token);
          setCurrentUser(loginRes.user);
        }
      } else {
        const loginRes = await api.login('user_admin_1');
        setToken(loginRes.token);
        setApiToken(loginRes.token);
        setCurrentUser(loginRes.user);
      }
    } catch (err) {
      console.error('Auth initialization error, logging in default user:', err);
      try {
        const loginRes = await api.login('user_admin_1');
        setToken(loginRes.token);
        setApiToken(loginRes.token);
        setCurrentUser(loginRes.user);
      } catch (fallbackErr) {
        console.error('Fallback login failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginWithCredentials = async ({ emailOrId, password }) => {
    setLoading(true);
    try {
      const res = await api.loginWithCredentials({ emailOrId, password });
      setToken(res.token);
      setApiToken(res.token);
      setCurrentUser(res.user);
      await fetchUsers();
      setIsLoginModalOpen(false);
      return res.user;
    } catch (err) {
      console.error('Credential login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsUser = async (userId) => {
    setLoading(true);
    try {
      const res = await api.login(userId);
      setToken(res.token);
      setApiToken(res.token);
      setCurrentUser(res.user);
      await fetchUsers();
      setIsLoginModalOpen(false);
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, role, department, password) => {
    setLoading(true);
    try {
      const res = await api.register(name, email, role, department, password);
      setToken(res.token);
      setApiToken(res.token);
      setCurrentUser(res.user);
      await fetchUsers();
      setIsLoginModalOpen(false);
      return res.user;
    } catch (e) {
      console.error('Registration failed:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const toggleMfa = async () => {
    try {
      const res = await api.toggleMfa();
      setCurrentUser(res.user);
      await fetchUsers();
    } catch (e) {
      console.error('MFA toggle failed:', e);
    }
  };

  const logout = () => {
    setToken(null);
    setApiToken('');
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        token,
        loading,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithCredentials,
        loginAsUser,
        registerUser,
        toggleMfa,
        logout,
        refreshUsers: fetchUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
