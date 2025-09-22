// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const axiosInstance = axios.create({
  baseURL: "https://gurudatta-distributers.onrender.com" || REACT_APP_API_URL, // no need for "||"
  withCredentials: true, // ✅ send cookies automatically
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasAuthCookie = () => {
    // ✅ simple cookie check to avoid useless 401s
    return document.cookie.split("; ").some((row) =>
      row.startsWith("authToken") // replace with your real cookie name
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      // 🔹 if no cookie → skip backend call
      if (!hasAuthCookie()) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/api/Auth/me");
        setUser(res.data); // { username, role }
      } catch (err) {
        if (err.response?.status === 401) {
          // cookie invalid/expired
          setUser(null);
        } else {
          console.error("Auth check failed:", err.message);
        }
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
