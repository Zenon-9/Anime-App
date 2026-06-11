/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const active = localStorage.getItem('aniverse_active_session');
      return active ? JSON.parse(active) : null;
    } catch {
      return null;
    }
  });

  // Sync active session
  useEffect(() => {
    if (user) {
      localStorage.setItem('aniverse_active_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('aniverse_active_session');
    }
  }, [user]);

  const signup = (username, email, password) => {
    const usersRaw = localStorage.getItem('aniverse_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username is already taken.');
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email is already registered.');
    }

    const newUser = { username, email, password };
    users.push(newUser);
    localStorage.setItem('aniverse_users', JSON.stringify(users));

    // Log in automatically
    const sessionUser = { username, email };
    setUser(sessionUser);
    return sessionUser;
  };

  const login = (emailOrUsername, password) => {
    const usersRaw = localStorage.getItem('aniverse_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const foundUser = users.find(
      u => 
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
         u.username.toLowerCase() === emailOrUsername.toLowerCase()) && 
        u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid email/username or password.');
    }

    const sessionUser = { username: foundUser.username, email: foundUser.email };
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
