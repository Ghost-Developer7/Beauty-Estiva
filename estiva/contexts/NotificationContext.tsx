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
import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  notificationInAppService,
  type InAppNotification,
} from "@/services/notificationInAppService";

// NEXT_PUBLIC_API_URL = "https://test.mehmetkara.xyz/api" gibi olabilir
// Hub URL icin /api kismini cikarip /hubs/notification ekliyoruz
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const HUB_URL = API_URL.replace(/\/api\/?$/, "") + "/hubs/notification";

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
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationInAppService.getUnreadCount();
      if (res.data.success) {
        setUnreadCount(res.data.data);
      }
    } catch {
      // silent
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      const res = await notificationInAppService.getNotifications(page, 20);
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
      // silent
    }
  }, []);

  // Mark single as read
  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await notificationInAppService.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silent
      }
    },
    []
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationInAppService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationInAppService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch {
      // silent
    }
  }, []);

  // SignalR connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = Cookies.get("estiva-token");
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveNotification", (notification: InAppNotification) => {
      setNotifications((prev) => {
        // Prevent duplicates
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
      setTotalCount((prev) => prev + 1);

      // Show toast for new notifications
      const toastType = notification.type === "error" ? "error" : "success";
      if (toastType === "error") {
        toast.error(notification.title, { duration: 4000 });
      } else {
        toast(notification.title, {
          duration: 4000,
          icon: "🔔",
        });
      }
    });

    connection.on("NotificationRead", (notificationId: number) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    });

    connection.on("AllNotificationsRead", () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    });

    connection.onreconnected(() => {
      setIsConnected(true);
      fetchUnreadCount();
    });

    connection.onclose(() => {
      setIsConnected(false);
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        connectionRef.current = connection;
        // Initial data fetch
        fetchUnreadCount();
        fetchNotifications(1);
      })
      .catch(() => {
        setIsConnected(false);
      });

    return () => {
      connection.stop();
      connectionRef.current = null;
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
