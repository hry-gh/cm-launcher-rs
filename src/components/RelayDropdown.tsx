import type { RelayWithPing } from "../types";

interface RelayDropdownProps {
  relays: RelayWithPing[];
  selectedRelay: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (relayId: string) => void;
}

export function RelayDropdown({
  relays,
  selectedRelay,
  isOpen,
  onToggle,
  onSelect,
}: RelayDropdownProps) {
  const selectedRelayName =
    relays.find((r) => r.id === selectedRelay)?.name || "Select";

  return (
    <div className="relay-dropdown">
      <button
        type="button"
        className="relay-dropdown-button"
        onClick={onToggle}
      >
        <span className="relay-dropdown-label">Relay:</span>
        <span className="relay-dropdown-value">{selectedRelayName}</span>
        <span className="relay-dropdown-arrow">
          {isOpen ? "\u25B2" : "\u25BC"}
        </span>
      </button>
      {isOpen && (
        <div className="relay-dropdown-menu">
          {relays.map((relay) => {
            const isDisabled = relay.ping === null && !relay.checking;
            const isSelected = selectedRelay === relay.id;

            return (
              <label
                key={relay.id}
                className={`relay-option ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="relay"
                  value={relay.id}
                  checked={isSelected}
                  onChange={() => onSelect(relay.id)}
                  disabled={isDisabled}
                />
                <span className="relay-name">{relay.name}</span>
                <span className="relay-ping">
                  {relay.checking
                    ? "..."
                    : relay.ping !== null
                      ? `${relay.ping}ms`
                      : "N/A"}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
