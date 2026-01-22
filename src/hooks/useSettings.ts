import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import type { AppSettings, AuthMode } from "../types";
import { useError } from "./useError";

export function useSettings(onAuthModeChange?: (mode: AuthMode) => void) {
  const [authMode, setAuthMode] = useState<AuthMode>("cm_ss13");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { showError } = useError();

  const loadSettings = useCallback(async () => {
    try {
      const settings = await invoke<AppSettings>("get_settings");
      return settings;
    } catch (err) {
      console.error("Failed to load settings:", err);
      return null;
    }
  }, []);

  const handleAuthModeChange = useCallback(
    async (mode: AuthMode) => {
      try {
        await invoke<AppSettings>("set_auth_mode", { mode });
        setAuthMode(mode);
        setShowSettingsModal(false);
        onAuthModeChange?.(mode);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    },
    [showError, onAuthModeChange],
  );

  const openSettings = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  return {
    authMode,
    setAuthMode,
    showSettingsModal,
    loadSettings,
    handleAuthModeChange,
    openSettings,
    closeSettings,
  };
}
