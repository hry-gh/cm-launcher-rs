import type { ErrorNotification } from "../types";

interface ErrorNotificationsProps {
  errors: ErrorNotification[];
  onDismiss: (id: number) => void;
}

export function ErrorNotifications({
  errors,
  onDismiss,
}: ErrorNotificationsProps) {
  return (
    <div className="error-notifications">
      {errors.map((error) => (
        <div key={error.id} className="error-popup">
          <div className="error-popup-message">{error.message}</div>
          <button
            type="button"
            className="error-popup-dismiss"
            onClick={() => onDismiss(error.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
