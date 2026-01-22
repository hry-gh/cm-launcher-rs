import { useEffect, useState } from "react";
import { RELAYS } from "../constants";
import type { RelayWithPing } from "../types";
import { pingRelay } from "../utils";

export function useRelays() {
  const [relays, setRelays] = useState<RelayWithPing[]>(
    RELAYS.map((r) => ({ ...r, ping: null, checking: true })),
  );
  const [selectedRelay, setSelectedRelay] = useState("direct");
  const [relayDropdownOpen, setRelayDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAllRelays = async () => {
      const results = await Promise.all(
        RELAYS.map(async (relay) => {
          const ping = await pingRelay(relay.host);
          return { ...relay, ping, checking: false };
        }),
      );
      results.sort((a, b) => {
        if (a.ping === null && b.ping === null) return 0;
        if (a.ping === null) return 1;
        if (b.ping === null) return -1;
        return a.ping - b.ping;
      });
      setRelays(results);
      const bestRelay = results.find((r) => r.ping !== null);
      if (bestRelay) {
        setSelectedRelay(bestRelay.id);
      }
    };
    checkAllRelays();
  }, []);

  const handleRelaySelect = (relayId: string) => {
    setSelectedRelay(relayId);
    setRelayDropdownOpen(false);
  };

  const toggleRelayDropdown = () => {
    setRelayDropdownOpen((prev) => !prev);
  };

  return {
    relays,
    selectedRelay,
    relayDropdownOpen,
    handleRelaySelect,
    toggleRelayDropdown,
  };
}
