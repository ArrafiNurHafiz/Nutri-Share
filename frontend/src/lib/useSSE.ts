import { useRealtime, RealtimeEvent } from "./useRealtime";

export function useSSE(
  userId: number | undefined,
  onNotification: (data: any) => void,
) {
  useRealtime(
    userId,
    undefined,
    (event: RealtimeEvent) => {
      if (event.event_type === "NOTIFICATION_CREATED") {
        onNotification(event.data);
      }
    },
    undefined,
    30000,
  );
}
