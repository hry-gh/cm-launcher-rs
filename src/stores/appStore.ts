import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { RELAYS, SERVER_API_URL, SERVER_FETCH_INTERVAL_MS } from "../constants";
import type {
  AppSettings,
  AuthMode,
  AuthState,
  RelayWithPing,
  Server,
  SteamAuthState,
  SteamUserInfo,
} from "../types";
import { pingRelay } from "../utils";

interface AppStore {
  // Auth
  authState: AuthState;
  authMode: AuthMode;
  setAuthState: (state: AuthState) => void;
  setAuthMode: (mode: AuthMode) => void;

  // Steam
  steamAuthState: SteamAuthState;
  setSteamAuthState: (state: SteamAuthState | ((prev: SteamAuthState) => SteamAuthState)) => void;

  // Relays
  relays: RelayWithPing[];
  selectedRelay: string;
  setRelays: (relays: RelayWithPing[]) => void;
  setSelectedRelay: (id: string) => void;

  // Servers
  servers: Server[];
  serversLoading: boolean;
  serversError: string | null;
  setServers: (servers: Server[]) => void;
  setServersLoading: (loading: boolean) => void;
  setServersError: (error: string | null) => void;
}

const initialAuthState: AuthState = {
  logged_in: false,
  user: null,
  loading: true,
  error: null,
};

const initialSteamAuthState: SteamAuthState = {
  available: false,
  user: null,
  access_token: null,
  loading: false,
  error: null,
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set) => ({
    // Auth
    authState: initialAuthState,
    authMode: "cm_ss13",
    setAuthState: (authState) => set({ authState }),
    setAuthMode: (authMode) => set({ authMode }),

    // Steam
    steamAuthState: initialSteamAuthState,
    setSteamAuthState: (stateOrUpdater) =>
      set((prev) => ({
        steamAuthState:
          typeof stateOrUpdater === "function"
            ? stateOrUpdater(prev.steamAuthState)
            : stateOrUpdater,
      })),

    // Relays
    relays: RELAYS.map((r) => ({ ...r, ping: null, checking: true })),
    selectedRelay: "direct",
    setRelays: (relays) => set({ relays }),
    setSelectedRelay: (selectedRelay) => set({ selectedRelay }),

    // Servers
    servers: [],
    serversLoading: true,
    serversError: null,
    setServers: (servers) => set({ servers }),
    setServersLoading: (serversLoading) => set({ serversLoading }),
    setServersError: (serversError) => set({ serversError }),
  }))
);

export function initAuthListener() {
  // Load initial auth state
  invoke<AuthState>("get_auth_state")
    .then((state) => useAppStore.getState().setAuthState(state))
    .catch((err) => {
      useAppStore.getState().setAuthState({
        logged_in: false,
        user: null,
        loading: false,
        error: String(err),
      });
    });

  // Listen for auth state changes
  return listen<AuthState>("auth-state-changed", (event) => {
    useAppStore.getState().setAuthState(event.payload);
  });
}

export async function initRelays() {
  const results = await Promise.all(
    RELAYS.map(async (relay) => {
      const ping = await pingRelay(relay.host);
      return { ...relay, ping, checking: false };
    })
  );

  results.sort((a, b) => {
    if (a.ping === null && b.ping === null) return 0;
    if (a.ping === null) return 1;
    if (b.ping === null) return -1;
    return a.ping - b.ping;
  });

  useAppStore.getState().setRelays(results);

  const bestRelay = results.find((r) => r.ping !== null);
  if (bestRelay) {
    useAppStore.getState().setSelectedRelay(bestRelay.id);
  }
}

export function initServerFetching() {
  const fetchServers = async () => {
    const { setServers, setServersLoading, setServersError } = useAppStore.getState();
    try {
      setServersLoading(true);
      const response = await fetch(SERVER_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setServers(data.servers || []);
      setServersError(null);
    } catch (err) {
      setServersError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setServersLoading(false);
    }
  };

  fetchServers();
  const interval = setInterval(fetchServers, SERVER_FETCH_INTERVAL_MS);
  return () => clearInterval(interval);
}

export async function initSteam(): Promise<boolean> {
  try {
    const steamUser = await invoke<SteamUserInfo>("get_steam_user_info");
    useAppStore.getState().setSteamAuthState((prev) => ({
      ...prev,
      available: true,
      user: steamUser,
    }));
    return true;
  } catch {
    useAppStore.getState().setSteamAuthState((prev) => ({
      ...prev,
      available: false,
    }));
    return false;
  }
}

// Load settings and set auth mode
export async function initSettings(): Promise<AppSettings | null> {
  try {
    const settings = await invoke<AppSettings>("get_settings");
    return settings;
  } catch (err) {
    console.error("Failed to load settings:", err);
    return null;
  }
}

// Selector hooks for fine-grained subscriptions
export const useAuthState = () => useAppStore((s) => s.authState);
export const useAuthMode = () => useAppStore((s) => s.authMode);
export const useSteamAuthState = () => useAppStore((s) => s.steamAuthState);
export const useRelays = () => useAppStore((s) => s.relays);
export const useSelectedRelay = () => useAppStore((s) => s.selectedRelay);
export const useServers = () => useAppStore((s) => s.servers);
export const useServersLoading = () => useAppStore((s) => s.serversLoading);
