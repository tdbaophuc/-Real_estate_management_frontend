import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BriefcaseBusiness, FileSignature, Settings, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification
} from "./notificationApi";

type NotificationPopoverProps = {
  onClose: () => void;
};

function notificationTone(notification: AppNotification) {
  const value = `${notification.type} ${notification.referenceType} ${notification.title}`.toUpperCase();

  if (value.includes("LEAD")) {
    return "lead";
  }

  if (value.includes("CONTRACT")) {
    return "contract";
  }

  return "system";
}

function NotificationIcon({ notification }: { notification: AppNotification }) {
  const tone = notificationTone(notification);

  if (tone === "lead") {
    return <UserPlus size={17} />;
  }

  if (tone === "contract") {
    return <FileSignature size={17} />;
  }

  if (notification.type.toUpperCase().includes("SYSTEM")) {
    return <Settings size={17} />;
  }

  return <BriefcaseBusiness size={17} />;
}

function formatNotificationTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime()) || diffMs < 0) {
    return value;
  }

  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(date);
}

function getNotificationPath(notification: AppNotification) {
  if (notification.actionUrl) {
    return notification.actionUrl;
  }

  if (!notification.referenceId) {
    return "";
  }

  const referenceType = notification.referenceType.toUpperCase();

  if (referenceType.includes("LEAD")) {
    return `/leads/${notification.referenceId}`;
  }

  if (referenceType.includes("CONTRACT")) {
    return `/contracts/${notification.referenceId}`;
  }

  if (referenceType.includes("TRANSACTION")) {
    return `/transactions/${notification.referenceId}`;
  }

  if (referenceType.includes("APPOINTMENT")) {
    return `/appointments/${notification.referenceId}`;
  }

  return "";
}

export function NotificationPopover({ onClose }: NotificationPopoverProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(8);
  const notificationsQuery = useQuery({
    queryFn: () => getNotifications({ page: 0, size: pageSize }),
    queryKey: ["notifications", "popover", pageSize],
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
  const normalizedError = notificationsQuery.error ? normalizeUnknownError(notificationsQuery.error) : null;
  const notifications = notificationsQuery.data?.content ?? [];
  const totalNotifications = notificationsQuery.data?.totalElements ?? notifications.length;
  const canLoadMore = totalNotifications > notifications.length;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleNotificationClick(notification: AppNotification) {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    onClose();

    const destination = getNotificationPath(notification);

    if (destination) {
      navigate(destination);
    }
  }

  return (
    <>
      <div className="notification-popover-overlay" role="presentation" onClick={onClose} />
      <section className="notification-popover" role="dialog" aria-label="Notifications">
        <header className="notif-header">
          <h2 className="notif-header-title">Notifications</h2>
          <button
            className="notif-mark-read"
            type="button"
            disabled={markAllMutation.isPending || !notifications.length}
            onClick={() => markAllMutation.mutate()}
          >
            Mark all as read
          </button>
        </header>

        <div className="notif-list">
          {notificationsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <div className="notif-item notif-skeleton" key={index} />)
          ) : null}
          {normalizedError ? (
            <div className="notif-state">
              <EmptyState
                title="Notifications could not be loaded"
                description={normalizedError.message}
                action={<Button size="sm" onClick={() => notificationsQuery.refetch()}>Retry</Button>}
              />
            </div>
          ) : null}
          {!notificationsQuery.isLoading && !normalizedError && !notifications.length ? (
            <div className="notif-state">
              <Bell size={22} />
              <strong>No notifications</strong>
            </div>
          ) : null}
          {notifications.map((notification) => (
            <button
              className={`notif-item ${notification.read ? "" : "unread"}`}
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
            >
              <span className={`notif-icon notif-icon-${notificationTone(notification)}`}>
                <NotificationIcon notification={notification} />
              </span>
              <span className="notif-copy">
                <span className="notif-title-row">
                  <strong>{notification.title}</strong>
                  {notification.createdAt ? <time>{formatNotificationTime(notification.createdAt)}</time> : null}
                </span>
                <span>{notification.message}</span>
              </span>
            </button>
          ))}
        </div>
        <footer className="notif-footer">
          <button
            type="button"
            disabled={!canLoadMore || notificationsQuery.isFetching}
            onClick={() => setPageSize((current) => Math.min(Math.max(current + 8, totalNotifications), totalNotifications || current + 8))}
          >
            View all notifications
          </button>
        </footer>
      </section>
    </>
  );
}
