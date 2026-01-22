import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import type { AuthModalState } from "../components/AuthModal";
import type { AuthState } from "../types";
import { useError } from "./useError";

const initialAuthState: AuthState = {
  logged_in: false,
  user: null,
  loading: true,
  error: null,
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalState, setAuthModalState] = useState<AuthModalState>("idle");
  const [authError, setAuthError] = useState<string | undefined>();
  const { showError } = useError();

  const loadAuthState = useCallback(async () => {
    try {
      const state = await invoke<AuthState>("get_auth_state");
      setAuthState(state);
    } catch (err) {
      setAuthState({
        logged_in: false,
        user: null,
        loading: false,
        error: String(err),
      });
    }
  }, []);

  useEffect(() => {
    loadAuthState();

    const unlisten = listen<AuthState>("auth-state-changed", (event) => {
      setAuthState(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [loadAuthState]);

  const handleLogin = useCallback(async () => {
    setAuthModalState("loading");
    setAuthError(undefined);
    try {
      const state = await invoke<AuthState>("start_login");
      setAuthState(state);
      if (state.logged_in) {
        setShowAuthModal(false);
        setAuthModalState("idle");
      }
    } catch (err) {
      setAuthModalState("error");
      setAuthError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const state = await invoke<AuthState>("logout");
      setAuthState(state);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }, [showError]);

  const onLoginRequired = useCallback((serverName?: string) => {
    setShowAuthModal(true);
    setAuthModalState("idle");
    return serverName;
  }, []);

  const onAuthModalClose = useCallback(() => {
    setShowAuthModal(false);
    setAuthModalState("idle");
  }, []);

  return {
    authState,
    setAuthState,
    showAuthModal,
    authModalState,
    authError,
    handleLogin,
    handleLogout,
    onLoginRequired,
    onAuthModalClose,
  };
}
