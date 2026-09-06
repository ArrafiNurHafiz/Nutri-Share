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
export const MULTITAB_CHANNEL_NAME = "nutrishare_realtime_channel";
export const STORAGE_SYNC_KEY = "nutrishare_mutation_sync";

let multiTabChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    multiTabChannel = new BroadcastChannel(MULTITAB_CHANNEL_NAME);
  }
} catch {
  multiTabChannel = null;
}

/**
 * Broadcasts a local mutation across all open browser tabs/windows
 * so other tabs immediately refresh their data without waiting for polling.
 */
export function broadcastMutation(eventType: string, data?: any) {
  const payload: RealtimeEvent = {
    event_id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    event_type: eventType || "DATA_MUTATION",
    timestamp: new Date().toISOString(),
    data: data || {},
  };

  // 1. BroadcastChannel for instant cross-tab sync
  try {
    if (multiTabChannel) {
      multiTabChannel.postMessage({
        type: "NUTRIRTIME_EVENT",
        payload,
      });
    }
  } catch {
    // ignore
  }

  // 2. LocalStorage event as a rock-solid cross-window/tab fallback
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(payload));
    }
  } catch {
    // ignore
  }
}

export function useRealtime(
  userId: number | undefined,
  role: string | undefined,
  onEvent: (event: RealtimeEvent) => void,
  fallbackPollFn?: () => void,
  pollIntervalMs: number = 5000,
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const fallbackRef = useRef(fallbackPollFn);
  fallbackRef.current = fallbackPollFn;

  const processedEventIds = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectAttempts = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // Throttled / debounced manual trigger to prevent concurrent burst requests
  const triggerSync = useCallback(() => {
    const now = Date.now();
    if (now - lastSyncTimeRef.current < 800) {
      return; // prevent spamming within 800ms
    }
    lastSyncTimeRef.current = now;
    if (fallbackRef.current) {
      fallbackRef.current();
    }
  }, []);

  const handleIncomingEvent = useCallback(
    (event: RealtimeEvent) => {
      if (!event || !event.event_id) return;
      // Duplicate event protection
      if (processedEventIds.current.has(event.event_id)) return;

      processedEventIds.current.add(event.event_id);
      if (processedEventIds.current.size > 200) {
        const oldest = Array.from(processedEventIds.current).slice(0, 50);
        oldest.forEach((id) => processedEventIds.current.delete(id));
      }

      // Always trigger data sync on incoming real-time events
      triggerSync();
      onEventRef.current(event);
    },
    [triggerSync],
  );

  // 1. Cross-tab synchronization via BroadcastChannel
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

  // 2. Cross-tab synchronization via localStorage storage event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_SYNC_KEY && e.newValue) {
        try {
          const payload: RealtimeEvent = JSON.parse(e.newValue);
          handleIncomingEvent(payload);
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [handleIncomingEvent]);

  // 3. Immediate revalidation on tab focus, visibility change, and online
  useEffect(() => {
    if (typeof window === "undefined" || !userId) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerSync();
      }
    };

    const onFocus = () => {
      triggerSync();
    };

    const onOnline = () => {
      triggerSync();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [userId, triggerSync]);

  // 4. SSE Stream + Adaptive Heartbeat Polling
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
        triggerSync();
      };

      es.addEventListener("message", (e: MessageEvent) => {
        try {
          const payload: RealtimeEvent = JSON.parse(e.data);
          handleIncomingEvent(payload);

          // Broadcast to other tabs
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

        triggerSync();

        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, backoff);
      };
    };

    connectSSE();

    // Fast adaptive heartbeat polling:
    // If tab is visible: run every pollIntervalMs (default 5000ms = 5s)
    const runPoll = () => {
      if (!isMounted) return;
      if (document.visibilityState === "visible") {
        triggerSync();
      }
    };

    pollTimer = setInterval(runPoll, pollIntervalMs);

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
  }, [userId, role, handleIncomingEvent, triggerSync, pollIntervalMs]);
}
