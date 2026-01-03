import { createContext, useContext, useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/* CONTEXT */
/* -------------------------------------------------------------------------- */
export const UserContext = createContext(null);

/* -------------------------------------------------------------------------- */
/* PROVIDER */
/* -------------------------------------------------------------------------- */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* LOAD USER FROM LOCAL STORAGE (ON REFRESH) */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* LOGIN */
  /* -------------------------------------------------------------------------- */
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* LOGOUT */
  /* -------------------------------------------------------------------------- */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,          // backward compatible
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/* CUSTOM HOOK (CLEAN USAGE) */
/* -------------------------------------------------------------------------- */
export const useUser = () => {
  return useContext(UserContext);
};
