// src/components/AuthWrapper.tsx
import { useState, useEffect } from "react";
import { authAPI } from "@/services/api";
import Iridescence from "@/components/Iridescence";
import { LogOut, User } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setShowLogin(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);
      setUser(data.user);
      setShowLogin(false);
    } catch (error: any) {
      setError(error.response?.data?.error || "Login failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.register(username, email, password, password);
      setUser(data.user);
      setShowLogin(false);
    } catch (error: any) {
      setError(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    setShowLogin(true);
    setUsername("");
    setPassword("");
    setEmail("");
  };

  if (showLogin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 -z-10 opacity-90">
          <Iridescence color={[0.4, 0.7, 0.9]} speed={0.4} amplitude={0.18} />
        </div>

        <div className="bg-background/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border/50">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Chemical Equipment Analyzer
          </h1>

          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isRegistering ? "Register" : "Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="w-full text-primary text-sm hover:underline"
            >
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground">
              Note: Backend must be running at localhost:8000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* User info header */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-background/90 backdrop-blur-xl border border-border/50 rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="font-medium">{user?.username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full transition-colors text-sm"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>

      {children}
    </div>
  );
}