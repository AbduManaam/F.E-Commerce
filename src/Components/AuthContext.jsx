


import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("isAdmin");

    if (stored) setUser(JSON.parse(stored));
    if (storedAdmin) setIsAdmin(JSON.parse(storedAdmin));
  }, []);

  const login = (userData, adminFlag = false) => {
    setUser(userData);
    setIsAdmin(adminFlag);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAdmin", JSON.stringify(adminFlag));
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);

    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
