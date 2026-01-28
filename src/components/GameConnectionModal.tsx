import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export type GameConnectionState = "idle" | "connecting" | "connected";

interface GameConnectionModalProps {
  visible: boolean;
  state: GameConnectionState;
  serverName: string | null;
  onClose: () => void;
}

export function GameConnectionModal({
  visible,
  state,
  serverName,
  onClose,
}: GameConnectionModalProps) {
  const [closing, setClosing] = useState(false);

  if (!visible) return null;

  const handleCloseGame = async () => {
    setClosing(true);
    try {
      await invoke("kill_game");
      onClose();
    } catch (err) {
      console.error("Failed to close game:", err);
    } finally {
      setClosing(false);
    }
  };

  const statusText =
    state === "connecting"
      ? `Connecting to ${serverName}...`
      : `Connected to ${serverName}`;

  return (
    <div className="game-connection-overlay">
      <div className="game-connection-modal">
        <div className="game-connection-status">
          {state === "connecting" && <div className="game-connection-spinner" />}
          <h2>{statusText}</h2>
        </div>
        <button
          type="button"
          className="button"
          onClick={handleCloseGame}
          disabled={closing}
        >
          {closing ? "Closing..." : "Close Game"}
        </button>
      </div>
    </div>
  );
}
