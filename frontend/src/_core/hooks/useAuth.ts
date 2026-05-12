import { useAuth as useAuthContext } from "../../contexts/AuthContext";
import { useLocation } from "wouter";
import { useCallback } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const { user, logout: contextLogout, isAdmin } = useAuthContext();
  const [, setLocation] = useLocation();

  const logout = useCallback(async () => {
    contextLogout();
    setLocation('/login');
  }, [contextLogout, setLocation]);

  const isAuthenticated = !!user;

  // Simple redirection logic
  if (redirectOnUnauthenticated && !isAuthenticated) {
    setLocation(redirectPath);
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    logout,
    loading: false, // Since it's localStorage based, it's instant
    refresh: () => {}
  };
}
