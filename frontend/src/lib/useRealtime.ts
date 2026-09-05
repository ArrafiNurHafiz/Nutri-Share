import { useEffect, useRef, useCallback } from "react";

export interface RealtimeEvent {
  event_id: string;
  event_type: string;
  resource_id?: number | string | null;
  timestamp: string;
  data: Record<string, any>;
}

const BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL) ||
  "";

// Multi-tab synchronization channel
let multiTabChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    multiTabChannel = new BroadcastChannel("nutrishare_realtime_channel");
  }
} catch {
  multiTabChannel = null;
}

export function useRealtime(
  userId: number | undefined,
  role: string | undefined,
  onEvent: (event: RealtimeEvent) => void,
  fallbackPollFn?: () => void,
  pollIntervalMs: number = 30000,
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const fallbackRef = useRef(fallbackPollFn);
  fallbackRef.current = fallbackPollFn;

  const processedEventIds = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttempts = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleIncomingEvent = useCallback((event: RealtimeEvent) => {
    if (!event || !event.event_id) return;
    // Duplicate event protection
    if (processedEventIds.current.has(event.event_id)) return;

    processedEventIds.current.add(event.event_id);
    if (processedEventIds.current.size > 200) {
      const oldest = Array.from(processedEventIds.current).slice(0, 50);
      oldest.forEach((id) => processedEventIds.current.delete(id));
    }

    onEventRef.current(event);
  }, []);

  useEffect(() => {
    if (!multiTabChannel) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "NUTRIRTIME_EVENT" && e.data.payload) {
        handleIncomingEvent(e.data.payload);
      }
    };

    multiTabChannel.addEventListener("message", handleMessage);
    return () => {
      multiTabChannel?.removeEventListener("message", handleMessage);
    };
  }, [handleIncomingEvent]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    let pollTimer: any = null;

    const connectSSE = () => {
      if (!isMounted) return;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const streamUrl = `${BASE_URL}/api/events/stream`;
      const es = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        reconnectAttempts.current = 0;
        // Trigger fresh sync on connection/reconnection
        if (fallbackRef.current) {
          fallbackRef.current();
        }
      };

      es.addEventListener("message", (e: MessageEvent) => {
        try {
          const payload: RealtimeEvent = JSON.parse(e.data);
          handleIncomingEvent(payload);

          // Broadcast to other browser tabs
          if (multiTabChannel) {
            multiTabChannel.postMessage({
              type: "NUTRIRTIME_EVENT",
              payload,
            });
          }
        } catch {
          // ignore malformed
        }
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        if (!isMounted) return;

        // Exponential backoff reconnect: 2s, 4s, 8s, up to max 30s
        const backoff = Math.min(
          30000,
          2000 * Math.pow(1.5, reconnectAttempts.current),
        );
        reconnectAttempts.current += 1;

        // Run fallback sync immediately when disconnected
        if (fallbackRef.current) {
          fallbackRef.current();
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, backoff);
      };
    };

    connectSSE();

    // Controlled background heartbeat fallback (e.g. every 30s)
    if (fallbackRef.current) {
      pollTimer = setInterval(() => {
        if (fallbackRef.current) {
          fallbackRef.current();
        }
      }, pollIntervalMs);
    }

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [userId, role, handleIncomingEvent, pollIntervalMs]);
}
