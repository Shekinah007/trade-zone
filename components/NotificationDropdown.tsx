"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (n: any) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      try {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === n._id ? { ...notif, isRead: true } : notif,
          ),
        );
        await fetch(`/api/notifications/${n._id}/read`, { method: "PUT" });
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
  };

  const handleActionClick = () => {
    if (selectedNotification?.link) {
      router.push(selectedNotification.link);
      setSelectedNotification(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full hover:bg-muted"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 max-h-[400px] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>
          <DropdownMenuSeparator />

          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="text-sm font-medium leading-none">
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {n.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center justify-center cursor-pointer"
                onClick={() => router.push("/notifications")}
              >
                View All
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={!!selectedNotification}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {selectedNotification?.message}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {selectedNotification?.createdAt
                ? new Date(selectedNotification.createdAt).toLocaleString()
                : ""}
            </p>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setSelectedNotification(null)}
            >
              Close
            </Button>
            {selectedNotification?.link && (
              <Button onClick={handleActionClick}>View Action</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
