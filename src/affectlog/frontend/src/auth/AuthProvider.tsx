import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, MeResponse, UserOut } from "../api/auth";

const SESSION_HINT_KEY = "affectlog_has_session";

interface AuthState {
  user: UserOut | null;
  workspaces: string[];
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  workspaces: [],
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me: MeResponse = await authApi.me();
      setUser(me.user);
      setWorkspaces(me.workspaces);
      localStorage.setItem(SESSION_HINT_KEY, "1");
    } catch {
      setUser(null);
      setWorkspaces([]);
      localStorage.removeItem(SESSION_HINT_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
    setWorkspaces([]);
    localStorage.removeItem(SESSION_HINT_KEY);
    window.location.href = "/login";
  }, []);

  // Only probe the server if a prior session was established — avoids a
  // guaranteed 401 console error on every fresh / logged-out page load.
  useEffect(() => {
    if (localStorage.getItem(SESSION_HINT_KEY)) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, workspaces, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
