import { PING_COUNT, PING_PORT, PING_TIMEOUT_MS } from "../constants";

export function pingRelay(host: string): Promise<number | null> {
  return new Promise((resolve) => {
    const socket = new WebSocket(`wss://${host}:${PING_PORT}`);
    const pingsSent: Record<string, number> = {};
    const pingTimes: number[] = [];
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.close();
        resolve(null);
      }
    }, PING_TIMEOUT_MS);

    socket.addEventListener("message", (event) => {
      pingTimes.push(Date.now() - pingsSent[event.data]);
      ping(Number(event.data) + 1);
    });

    socket.addEventListener("open", () => {
      ping(1);
    });

    socket.addEventListener("error", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        socket.close();
        resolve(null);
      }
    });

    const ping = (iter: number) => {
      if (iter > PING_COUNT) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          socket.close();
          const avgPing = Math.round(
            pingTimes.reduce((a, b) => a + b) / pingTimes.length,
          );
          resolve(avgPing);
        }
      } else {
        pingsSent[String(iter)] = Date.now();
        socket.send(String(iter));
      }
    };
  });
}
