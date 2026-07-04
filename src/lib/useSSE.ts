import { useEffect, useRef, useCallback } from "react";

export function useSSE(userId: number | undefined, onNotification: (data: any) => void) {
  const lastEventRef = useRef<string>("");
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;

  useEffect(() => {
    if (!userId) return;
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (eventSource) eventSource.close();
      eventSource = new EventSource(`/api/notifications/subscribe?user_id=${userId}`);

      eventSource.onmessage = (e) => {
        if (e.data === "connected") return;
        if (e.data === lastEventRef.current) return; // dedup
        lastEventRef.current = e.data;
        try {
          const data = JSON.parse(e.data);
          cbRef.current(data);
        } catch { /* ignore ping */ }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimer);
    };
  }, [userId]);
}
