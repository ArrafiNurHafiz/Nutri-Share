import { useEffect, useRef } from "react";
import { api } from "./api";

export function useSSE(
  userId: number | undefined,
  onNotification: (data: any) => void,
) {
  const cbRef = useRef(onNotification);
  const lastNotifId = useRef<number>(0);
  cbRef.current = onNotification;

  useEffect(() => {
    if (!userId) return;

    const poll = async () => {
      try {
        const data = await api.fetchJSON(
          `/api/notifications?user_id=${userId}`,
        );
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          if (latest.id !== lastNotifId.current) {
            lastNotifId.current = latest.id;
            cbRef.current(data);
          }
        }
      } catch {
        // silent
      }
    };

    // Initial fetch
    poll();

    // Poll every 30 seconds
    const timer = setInterval(poll, 30000);
    return () => clearInterval(timer);
  }, [userId]);
}
