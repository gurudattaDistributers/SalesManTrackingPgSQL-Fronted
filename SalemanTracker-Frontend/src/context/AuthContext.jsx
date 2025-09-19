// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: "https://localhost:7154",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/api/Auth/me");
        // res.data = { username, role }
        setUser(res.data);
      } catch (err) {
        console.error("Auth check failed:", err.response?.status);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
