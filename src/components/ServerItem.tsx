import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { GAME_STATES } from "../constants";
import { useError } from "../hooks/useError";
import type { AuthMode, RelayWithPing, Server } from "../types";
import { formatDuration } from "../utils";

interface ServerItemProps {
  server: Server;
  selectedRelay: string;
  relays: RelayWithPing[];
  isLoggedIn: boolean;
  authMode: AuthMode;
  steamAccessToken: string | null;
  onLoginRequired: (serverName?: string) => void;
  onSteamAuthRequired: (serverName?: string) => void;
}

export function ServerItem({
  server,
  selectedRelay,
  relays,
  isLoggedIn,
  authMode,
  steamAccessToken,
  onLoginRequired,
  onSteamAuthRequired,
}: ServerItemProps) {
  const [connecting, setConnecting] = useState(false);
  const { showError } = useError();

  const relay = relays.find((r) => r.id === selectedRelay);
  const port = server.url.split(":")[1];
  const isOnline = server.status === "available";
  const data = server.data;
  const byondVersion = server.recommended_byond_version;

  const handleConnect = async () => {
    if (authMode === "cm_ss13" && !isLoggedIn) {
      onLoginRequired(server.name);
      return;
    }

    if (authMode === "steam" && !steamAccessToken) {
      onSteamAuthRequired(server.name);
      return;
    }

    if (!relay || !byondVersion || !port) return;

    setConnecting(true);

    try {
      let accessToken: string | null = null;
      if (authMode === "cm_ss13") {
        accessToken = await invoke<string | null>("get_access_token");
      } else if (authMode === "steam") {
        accessToken = steamAccessToken;
      }

      await invoke("connect_to_server", {
        version: byondVersion,
        host: relay.host,
        port: port,
        accessType: authMode,
        accessToken: accessToken,
        serverName: server.name,
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnecting(false);
    }
  };

  const canConnect = isOnline && relay && byondVersion && port;

  return (
    <div className="server-item">
      <div className="server-info">
        <div className="server-name">{server.name}</div>
        {isOnline && data ? (
          <div className="server-details">
            <span>Round #{data.round_id}</span>
            <span>{data.mode}</span>
            <span>{data.map_name}</span>
            <span>{formatDuration(data.round_duration)}</span>
            <span>{GAME_STATES[data.gamestate] || "Unknown"}</span>
          </div>
        ) : (
          <div className="server-details">
            <span>Server unavailable</span>
          </div>
        )}
      </div>
      <div className="server-status">
        <div className={`status-indicator ${!isOnline ? "offline" : ""}`} />
        <div className="player-count">
          {isOnline && data ? data.players : "--"}
        </div>
        <button
          type="button"
          className="button"
          onClick={handleConnect}
          disabled={!canConnect || connecting}
        >
          {connecting ? "Connecting..." : "Connect"}
        </button>
      </div>
    </div>
  );
}
