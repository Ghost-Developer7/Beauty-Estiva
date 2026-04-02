import api from "@/lib/api";

export interface InAppNotification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
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
  list(page = 1, pageSize = 20) {
    return api.get<{ success: boolean; data: NotificationPageResult }>(
      "/notification/in-app",
      { params: { page, pageSize } },
    );
  },

  unreadCount() {
    return api.get<{ success: boolean; data: number }>(
      "/notification/in-app/unread-count",
    );
  },

  markRead(id: number) {
    return api.patch(`/notification/in-app/${id}/read`);
  },

  markAllRead() {
    return api.patch("/notification/in-app/read-all");
  },

  delete(id: number) {
    return api.delete(`/notification/in-app/${id}`);
  },
};
