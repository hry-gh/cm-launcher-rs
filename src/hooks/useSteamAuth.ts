import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import type { SteamAuthModalState } from "../components/SteamAuthModal";
import { useAppStore } from "../stores";
import type { SteamAuthResult, SteamUserInfo } from "../types";

export function useSteamAuth() {
  const [showSteamAuthModal, setShowSteamAuthModal] = useState(false);
  const [steamAuthModalState, setSteamAuthModalState] =
    useState<SteamAuthModalState>("idle");
  const [steamAuthError, setSteamAuthError] = useState<string | undefined>();
  const [steamLinkingUrl, setSteamLinkingUrl] = useState<string | undefined>();

  const setSteamAuthState = useAppStore((s) => s.setSteamAuthState);

  const initializeSteam = useCallback(async () => {
    try {
      const steamUser = await invoke<SteamUserInfo>("get_steam_user_info");
      setSteamAuthState((prev) => ({
        ...prev,
        available: true,
        user: steamUser,
      }));
      return true;
    } catch {
      setSteamAuthState((prev) => ({
        ...prev,
        available: false,
      }));
      return false;
    }
  }, [setSteamAuthState]);

  const handleSteamAuthenticate = useCallback(
    async (createAccountIfMissing: boolean) => {
      setSteamAuthModalState("loading");
      setSteamAuthError(undefined);
      setSteamLinkingUrl(undefined);

      try {
        const result = await invoke<SteamAuthResult>("steam_authenticate", {
          createAccountIfMissing,
        });

        if (result.success && result.access_token) {
          setSteamAuthState((prev) => ({
            ...prev,
            access_token: result.access_token,
            error: null,
          }));
          setShowSteamAuthModal(false);
          setSteamAuthModalState("idle");
          return result;
        }
        if (result.requires_linking) {
          setSteamAuthModalState("linking");
          setSteamLinkingUrl(result.linking_url || undefined);
          return result;
        }
        setSteamAuthModalState("error");
        setSteamAuthError(result.error || "Authentication failed");
        return result;
      } catch (err) {
        setSteamAuthModalState("error");
        setSteamAuthError(err instanceof Error ? err.message : String(err));
        return null;
      }
    },
    [setSteamAuthState]
  );

  const onSteamAuthModalClose = useCallback(async () => {
    setShowSteamAuthModal(false);
    setSteamAuthModalState("idle");

    try {
      await invoke("cancel_steam_auth_ticket");
    } catch {
      // Ignore errors when canceling
    }
  }, []);

  const handleSteamLogout = useCallback(() => {
    setSteamAuthState((prev) => ({
      ...prev,
      access_token: null,
    }));
  }, [setSteamAuthState]);

  return {
    showSteamAuthModal,
    setShowSteamAuthModal,
    steamAuthModalState,
    steamAuthError,
    steamLinkingUrl,
    initializeSteam,
    handleSteamAuthenticate,
    onSteamAuthModalClose,
    handleSteamLogout,
  };
}
