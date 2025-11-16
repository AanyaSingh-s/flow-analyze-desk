import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "flow-analyze-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as User | null;
    if (parsed && typeof parsed.email === "string") {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Failed to read auth storage", error);
    return null;
  }
};

const storeUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Failed to write auth storage", error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const generateId = useCallback(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `user_${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
  }, []);

  useEffect(() => {
    storeUser(user);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    void password;
    await new Promise((resolve) => setTimeout(resolve, 400));
    setUser({
      id: generateId(),
      email: email.toLowerCase(),
    });
  }, [generateId]);

  const signup = useCallback(async (email: string, password: string) => {
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
