import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { getProfile, login as loginRequest, register as registerRequest } from "../services/authService";

export const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = "uni_assistant_token";
const ROLE_STORAGE_KEY = "uni_assistant_role";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setToken(null);
    setRole(null);
    setUser(null);
  }, []);

  const storeAuth = useCallback((authToken, authUser) => {
    const authRole = authUser?.role || null;

    localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
    if (authRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, authRole);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }

    setToken(authToken);
    setRole(authRole);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        const profile = response.data;

        setUser(profile);
        setRole(profile?.role || null);
        if (profile?.role) {
          localStorage.setItem(ROLE_STORAGE_KEY, profile.role);
        } else {
          localStorage.removeItem(ROLE_STORAGE_KEY);
        }
      } catch (_error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [token, clearAuth]);

  useEffect(() => {
    const handleStorage = (event) => {
      if ((event.key === TOKEN_STORAGE_KEY || event.key === ROLE_STORAGE_KEY) && !event.newValue) {
        clearAuth();
      }
    };

    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [clearAuth]);

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    const authToken = response.data.token;
    const authUser = response.data.user;
    storeAuth(authToken, authUser);
    return authUser;
  };

  const register = async (payload) => {
    const response = await registerRequest(payload);
    const authToken = response.data.token;
    const authUser = response.data.user;
    storeAuth(authToken, authUser);
    return authUser;
  };

  const isAuthenticated = Boolean(token && user);

  const value = useMemo(
    () => ({ user, token, role, loading, login, register, logout, isAuthenticated }),
    [user, token, role, loading, isAuthenticated, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
