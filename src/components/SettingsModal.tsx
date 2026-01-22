import type { AuthMode } from "../types";
import { Modal, ModalCloseButton } from "./Modal";

interface AuthModeOptionProps {
  mode: AuthMode;
  currentMode: AuthMode;
  name: string;
  description: string;
  onChange: (mode: AuthMode) => void;
}

function AuthModeOption({
  mode,
  currentMode,
  name,
  description,
  onChange,
}: AuthModeOptionProps) {
  return (
    <label
      className={`auth-mode-option ${currentMode === mode ? "selected" : ""}`}
    >
      <input
        type="radio"
        name="authMode"
        value={mode}
        checked={currentMode === mode}
        onChange={() => onChange(mode)}
      />
      <div className="auth-mode-info">
        <span className="auth-mode-name">{name}</span>
        <span className="auth-mode-desc">{description}</span>
      </div>
    </label>
  );
}

interface SettingsModalProps {
  visible: boolean;
  authMode: AuthMode;
  steamAvailable: boolean;
  onAuthModeChange: (mode: AuthMode) => void;
  onClose: () => void;
}

export function SettingsModal({
  visible,
  authMode,
  steamAvailable,
  onAuthModeChange,
  onClose,
}: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      className="settings-modal"
      overlayClassName="settings-modal-overlay"
      closeOnOverlayClick
    >
      <div className="settings-modal-header">
        <h2>Settings</h2>
        <ModalCloseButton onClick={onClose} />
      </div>
      <div className="settings-modal-content">
        <div className="settings-section">
          <h3>Authentication Mode</h3>
          <p className="settings-description">
            Choose how you want to authenticate when connecting to servers.
          </p>
          <div className="auth-mode-options">
            <AuthModeOption
              mode="cm_ss13"
              currentMode={authMode}
              name="CM-SS13 Authentication"
              description="Login with your CM-SS13 account for server access"
              onChange={onAuthModeChange}
            />
            {steamAvailable && (
              <AuthModeOption
                mode="steam"
                currentMode={authMode}
                name="Steam Authentication"
                description="Login with your Steam account"
                onChange={onAuthModeChange}
              />
            )}
            <AuthModeOption
              mode="byond"
              currentMode={authMode}
              name="BYOND Authentication"
              description="Use BYOND's built-in authentication (no login required)"
              onChange={onAuthModeChange}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
