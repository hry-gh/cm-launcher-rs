import { useEffect, useState } from "react";
import { SERVER_API_URL, SERVER_FETCH_INTERVAL_MS } from "../constants";
import type { Server } from "../types";

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const response = await fetch(SERVER_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        setServers(data.servers || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
    const interval = setInterval(fetchServers, SERVER_FETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { servers, loading, error };
}
