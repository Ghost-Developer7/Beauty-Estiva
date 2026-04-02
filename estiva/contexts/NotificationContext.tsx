"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  notificationInAppService,
  type InAppNotification,
} from "@/services/notificationInAppService";

interface NotificationContextValue {
  notifications: InAppNotification[];
  unreadCount: number;
  isConnected: boolean;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationInAppService.unreadCount();
      if (res.data.success) {
        setUnreadCount(res.data.data);
      }
    } catch {
      /* unread count is non-critical, UI falls back to 0 */
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      const res = await notificationInAppService.list(page, 20);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        if (page === 1) {
          setNotifications(d.items);
        } else {
          setNotifications((prev) => [...prev, ...d.items]);
        }
        setTotalCount(d.totalCount);
        setCurrentPage(d.page);
        setTotalPages(d.totalPages);
      }
    } catch {
      /* notification list fetch failure is non-critical, panel shows empty state */
    }
  }, []);

  // Mark single as read
  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await notificationInAppService.markRead(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        /* mark-as-read failure is non-critical */
      }
    },
    []
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationInAppService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      /* mark-all-as-read failure is non-critical */
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationInAppService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch {
      /* delete failure is non-critical */
    }
  }, []);

  // SSE connection (replaces SignalR)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = Cookies.get("estiva-token");
    if (!token) return;

    // Use SSE for real-time notifications
    const sseUrl = `/api/notification/stream`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "connected") {
          setIsConnected(true);
          fetchUnreadCount();
          fetchNotifications(1);
          return;
        }

        if (parsed.type === "ReceiveNotification") {
          const notification: InAppNotification = parsed.data;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === notification.id)) return prev;
            return [notification, ...prev];
          });
          setUnreadCount((prev) => prev + 1);
          setTotalCount((prev) => prev + 1);

          // Show toast
          if (notification.type === "error") {
            toast.error(notification.title, { duration: 4000 });
          } else {
            toast(notification.title, {
              duration: 4000,
              icon: "\uD83D\uDD14",
            });
          }
        }
      } catch {
        /* JSON parse error on SSE message is non-critical */
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // EventSource will auto-reconnect
    };

    eventSourceRef.current = eventSource;

    // Initial data fetch
    fetchUnreadCount();
    fetchNotifications(1);

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [isAuthenticated, user, fetchUnreadCount, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        totalCount,
        currentPage,
        totalPages,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
