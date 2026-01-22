import { getCurrentWindow } from "@tauri-apps/api/window";

export function Titlebar() {
  const handleMinimize = async () => {
    const window = getCurrentWindow();
    await window.minimize();
  };

  const handleClose = async () => {
    const window = getCurrentWindow();
    await window.close();
  };

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-title">CM-SS13 Launcher</div>
      <div className="titlebar-buttons">
        <button
          type="button"
          className="titlebar-button"
          onClick={handleMinimize}
        >
          <span className="titlebar-icon">-</span>
        </button>
        <button
          type="button"
          className="titlebar-button titlebar-close"
          onClick={handleClose}
        >
          <span className="titlebar-icon">x</span>
        </button>
      </div>
    </div>
  );
}
