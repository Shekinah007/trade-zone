"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  Filter,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Tag,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NotificationType = "offer" | "message" | "price" | "alert" | "info";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  type?: string;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  offer: {
    icon: ShoppingBag,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  message: {
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  price: {
    icon: Tag,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  alert: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  info: {
    icon: Info,
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-800/40",
  },
};

function getTypeConfig(type?: string) {
  const key = (type && type in TYPE_CONFIG ? type : "info") as NotificationType;
  return TYPE_CONFIG[key];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function groupByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const toKey = (d: Date) => d.toDateString();

  const map = new Map<string, Notification[]>();
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const key = toKey(d);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }

  for (const [key, items] of map.entries()) {
    let label = key;
    if (key === toKey(today)) label = "Today";
    else if (key === toKey(yesterday)) label = "Yesterday";
    else
      label = new Date(key).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    groups.push({ label, items });
  }

  return groups;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [selected, setSelected] = useState<Notification | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" }).catch(
      () => {},
    );
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications/read-all", { method: "PUT" }).catch(
      () => {},
    );
    setMarkingAll(false);
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n._id);
    setSelected(n);
  };

  const handleAction = () => {
    if (selected?.link) {
      router.push(selected.link);
      setSelected(null);
    }
  };

  const filtered =
    tab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full -ml-1"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <Badge className="h-5 px-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-600">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground gap-1.5 h-8"
                onClick={markAllAsRead}
                disabled={markingAll}
              >
                {markingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                Mark all read
              </Button>
            )}
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "all" | "unread")}
            className="mt-3"
          >
            <TabsList className="h-8 bg-muted/60 p-0.5">
              <TabsTrigger value="all" className="h-7 text-xs px-4">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="h-7 text-xs px-4">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-medium text-blue-600">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading notifications…</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState unread={tab === "unread"} />
        ) : (
          <div className="space-y-6">
            {groups.map(({ label, items }) => (
              <section key={label}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  {label}
                </p>
                <div className="rounded-xl border bg-card divide-y overflow-hidden">
                  {items.map((n) => (
                    <NotificationRow
                      key={n._id}
                      notification={n}
                      onClick={() => handleClick(n)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-3">
              {selected && (
                <div
                  className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center mt-0.5",
                    getTypeConfig(selected.type).bg,
                  )}
                >
                  {(() => {
                    const Icon = getTypeConfig(selected.type).icon;
                    return (
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          getTypeConfig(selected.type).color,
                        )}
                      />
                    );
                  })()}
                </div>
              )}
              <DialogTitle className="text-base leading-snug pt-1">
                {selected?.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-2 px-0.5">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {selected?.message}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {selected?.createdAt
                ? new Date(selected.createdAt).toLocaleString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(null)}
            >
              Close
            </Button>
            {selected?.link && (
              <Button size="sm" onClick={handleAction}>
                View Action
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationRow({
  notification: n,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const { icon: Icon, color, bg } = getTypeConfig(n.type);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors",
        "hover:bg-muted/50 active:bg-muted/80",
        !n.isRead && "bg-blue-50/40 dark:bg-blue-950/20",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center mt-0.5",
          bg,
        )}
      >
        <Icon className={cn("h-4 w-4", color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug line-clamp-1",
              !n.isRead
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/90",
            )}
          >
            {n.title}
          </p>
          <span className="flex-shrink-0 text-[10px] text-muted-foreground mt-0.5 tabular-nums">
            {timeAgo(n.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {n.message}
        </p>
      </div>

      {/* Unread dot */}
      {!n.isRead && (
        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 mt-2" />
      )}
    </button>
  );
}

function EmptyState({ unread }: { unread: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        {unread ? (
          <Check className="h-7 w-7 text-muted-foreground" />
        ) : (
          <BellOff className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {unread ? "All caught up!" : "No notifications yet"}
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          {unread
            ? "You've read all your notifications."
            : "We'll notify you when something happens."}
        </p>
      </div>
    </div>
  );
}
