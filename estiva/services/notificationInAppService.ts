import api from "@/lib/api";

export interface InAppNotification {
  id: number;
  title: string;
  message: string;
  type: string; // info, success, warning, error
  entityType?: string;
  entityId?: number;
  actionUrl?: string;
  icon?: string;
  isRead: boolean;
  readAt?: string;
  cDate?: string;
}

export interface NotificationPageResult {
  items: InAppNotification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const notificationInAppService = {
  getNotifications: (page = 1, pageSize = 20) =>
    api.get<{ success: boolean; data: NotificationPageResult }>(
      `/notification/in-app?page=${page}&pageSize=${pageSize}`
    ),

  getUnreadCount: () =>
    api.get<{ success: boolean; data: number }>("/notification/in-app/unread-count"),

  markAsRead: (id: number) =>
    api.patch(`/notification/in-app/${id}/read`),

  markAllAsRead: () =>
    api.patch("/notification/in-app/read-all"),

  deleteNotification: (id: number) =>
    api.delete(`/notification/in-app/${id}`),
};
