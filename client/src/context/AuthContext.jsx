import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));

  const loginUser = (t) => { localStorage.setItem('adminToken', t); setToken(t); };
  const logout = () => { localStorage.removeItem('adminToken'); setToken(null); };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
