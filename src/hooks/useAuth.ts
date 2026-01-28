import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import type { AuthModalState } from "../components/AuthModal";
import { useAppStore } from "../stores";
import type { AuthState } from "../types";
import { useError } from "./useError";

export function useAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalState, setAuthModalState] = useState<AuthModalState>("idle");
  const [authError, setAuthError] = useState<string | undefined>();
  const { showError } = useError();

  const setAuthState = useAppStore((s) => s.setAuthState);

  const handleLogin = useCallback(async () => {
    setShowAuthModal(true);
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
  }, [setAuthState]);

  const handleLogout = useCallback(async () => {
    try {
      const state = await invoke<AuthState>("logout");
      setAuthState(state);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }, [setAuthState, showError]);

  const onAuthModalClose = useCallback(() => {
    setShowAuthModal(false);
    setAuthModalState("idle");
  }, []);

  return {
    showAuthModal,
    authModalState,
    authError,
    handleLogin,
    handleLogout,
    onAuthModalClose,
  };
}
