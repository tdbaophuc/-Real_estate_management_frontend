import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, MailOpen } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Pagination } from "../../shared/ui/Pagination";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatDate } from "../../shared/lib/format";
import { useText } from "../../shared/i18n/useText";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification
} from "./notificationApi";

const pageSize = 12;

function safeFormatDate(value: string) {
  try {
    return formatDate(value);
  } catch {
    return value;
  }
}

function NotificationRow({
  notification,
  onMarkRead
}: {
  notification: AppNotification;
  onMarkRead: (notificationId: number | string) => void;
}) {
  const tx = useText();

  return (
    <article className="notification-row">
      <div className="notification-icon">
        {notification.read ? <MailOpen size={18} /> : <Bell size={18} />}
      </div>
      <div>
        <div className="notification-title-line">
          <h3>{notification.title}</h3>
          <StatusBadge tone={notification.read ? "neutral" : "info"}>
            {notification.read ? tx("Read") : tx("Unread")}
          </StatusBadge>
        </div>
        <p>{notification.message}</p>
        <small>
          {notification.channel}
          {notification.createdAt ? ` - ${safeFormatDate(notification.createdAt)}` : ""}
        </small>
      </div>
      {!notification.read ? (
        <Button variant="secondary" size="sm" onClick={() => onMarkRead(notification.id)}>
          <CheckCheck size={16} />
          {tx("Mark read")}
        </Button>
      ) : null}
    </article>
  );
}

export function NotificationsPage() {
  const tx = useText();
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryFn: () => getNotifications({ page, size: pageSize }),
    queryKey: ["notifications", page],
    retry: 1
  });
  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }
  });
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    }
  });
  const normalizedError = notificationsQuery.error
    ? normalizeUnknownError(notificationsQuery.error)
    : null;

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">{tx("Notifications")}</p>
          <h2>{tx("Notification center")}</h2>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || !notificationsQuery.data?.content.length}
        >
          <CheckCheck size={16} />
          {tx("Mark all read")}
        </Button>
      </div>
      {notificationsQuery.isLoading ? (
        <div className="notification-list">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="notification-row notification-skeleton" key={index} />
          ))}
        </div>
      ) : null}
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title={tx("Notifications could not be loaded")}
            description={normalizedError.message}
            action={<Button onClick={() => notificationsQuery.refetch()}>{tx("Retry")}</Button>}
          />
        </div>
      ) : null}
      {notificationsQuery.data && notificationsQuery.data.content.length === 0 ? (
        <div className="content-section">
          <EmptyState
            title={tx("No notifications")}
            description={tx("Unread system updates and workflow alerts will appear here.")}
          />
        </div>
      ) : null}
      {notificationsQuery.data && notificationsQuery.data.content.length > 0 ? (
        <>
          <div className="notification-list">
            {notificationsQuery.data.content.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={(notificationId) => markReadMutation.mutate(notificationId)}
              />
            ))}
          </div>
          <Pagination
            page={notificationsQuery.data.page}
            totalPages={notificationsQuery.data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </section>
  );
}
