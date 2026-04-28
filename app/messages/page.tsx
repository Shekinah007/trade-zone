"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  User,
  Loader2,
  Inbox,
  Search,
  Filter,
  CheckCheck,
  Clock,
  Star,
  Archive,
  Trash2,
  Sparkles,
  Shield,
  Crown,
  Mail,
  MailOpen,
  Send,
  ArrowLeft,
  ChevronRight,
  PlusCircle,
  Bell,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations();
    }
  }, [status]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find(
      (p: any) => p._id !== session?.user?.id,
    );
    const matchesSearch =
      otherParticipant?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    const isConvUnread =
      session?.user?.id &&
      conv.unreadCount &&
      conv.unreadCount[session.user.id] > 0;

    if (activeTab === "unread") {
      return matchesSearch && isConvUnread;
    }
    return matchesSearch;
  });

  const unreadCount = conversations.filter(
    (conv) =>
      session?.user?.id &&
      conv.unreadCount &&
      conv.unreadCount[session.user.id] > 0,
  ).length;
  const todayMessages = conversations.filter((conv) => {
    const lastMessageDate = new Date(conv.lastMessageAt);
    const today = new Date();
    return lastMessageDate.toDateString() === today.toDateString();
  }).length;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-emerald-600 mx-auto mb-4 relative" />
          </div>
          <p className="text-muted-foreground font-medium">
            Loading your messages...
          </p>
          <p className="text-xs text-muted-foreground mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Welcome to Messages
            </h2>
            <p className="text-muted-foreground mb-6">
              Sign in to view and manage your conversations with buyers and
              sellers.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
            >
              <Link href="/auth/signin">Sign In to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg" />
                <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <MessageSquare className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Messages
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your conversations with buyers and sellers
                </p>
              </div>
            </div>

            {/* <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-emerald-500/20 hover:bg-emerald-500/10"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div> */}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 to-transparent">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Conversations
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {conversations.length}
                    </p>
                  </div>
                  <Inbox className="h-6 w-6 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 to-transparent">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Unread</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {unreadCount}
                    </p>
                  </div>
                  <Mail className="h-6 w-6 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {todayMessages}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {
                        conversations.filter(
                          (c) => c.lastMessageSender === session?.user?.id,
                        ).length
                      }
                    </p>
                  </div>
                  <Send className="h-6 w-6 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 border-b bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500 bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-200"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <div className="flex bg-muted/50 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md transition-all",
                      viewMode === "list"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "hover:bg-emerald-500/10",
                    )}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-md transition-all",
                      viewMode === "grid"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "hover:bg-emerald-500/10",
                    )}
                  >
                    Grid View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-4 pt-4">
              <TabsList className="bg-emerald-500/10 p-1">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2"
                >
                  <Inbox className="h-4 w-4" />
                  All Messages
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {conversations.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Unread
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-5 px-1.5 text-[10px]"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {viewMode === "list" ? (
                <ConversationList
                  conversations={filteredConversations}
                  userId={session?.user?.id}
                />
              ) : (
                <ConversationGrid
                  conversations={filteredConversations}
                  userId={session?.user?.id}
                />
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              {viewMode === "list" ? (
                <ConversationList
                  conversations={filteredConversations}
                  userId={session?.user?.id}
                />
              ) : (
                <ConversationGrid
                  conversations={filteredConversations}
                  userId={session?.user?.id}
                />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  userId,
}: {
  conversations: any[];
  userId: string | undefined;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
            <MailOpen className="h-12 w-12 text-emerald-600" />
          </div>
        </div>
        <h3 className="font-semibold text-xl mb-2">Your inbox is empty</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          When you start a conversation with a buyer or seller, it will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-emerald-100 dark:divide-emerald-900/20">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id !== userId,
        );
        const isUnread =
          userId && conv.unreadCount && conv.unreadCount[userId] > 0;

        return (
          <Link
            key={conv._id}
            href={`/messages/${conv._id}`}
            className={cn(
              "flex items-center p-5 gap-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent dark:hover:from-emerald-950/20 group relative",
              isUnread &&
                "bg-gradient-to-r from-emerald-50/30 to-transparent dark:from-emerald-950/10",
            )}
          >
            {/* Status indicator bar */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-1 transition-all",
                isUnread
                  ? "bg-emerald-500"
                  : "bg-transparent group-hover:bg-emerald-500/30",
              )}
            />

            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-emerald-500/20 shadow-lg transition-transform group-hover:scale-105">
                <AvatarImage src={otherParticipant?.image} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg font-bold">
                  {otherParticipant?.name?.[0] || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 shadow-sm" />
              {isUnread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "font-semibold text-base truncate",
                      isUnread && "text-emerald-700 dark:text-emerald-400",
                    )}
                  >
                    {otherParticipant?.name || "Unknown User"}
                  </span>
                  {conv.listing?.isVerified && (
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  {conv.isPriority && (
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                {conv.lastMessageAt && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(conv.lastMessageAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate max-w-[70%]",
                      isUnread
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {conv.lastMessage || "Started a conversation"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {conv.listing && (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-secondary/50 max-w-[120px] truncate border-emerald-200"
                    >
                      📦 {conv.listing.title}
                    </Badge>
                  )}
                  {conv.lastMessageSender === userId && (
                    <CheckCheck
                      className={cn(
                        "h-4 w-4",
                        conv.participants.every(
                          (p: any) =>
                            p._id === userId ||
                            !conv.unreadCount ||
                            conv.unreadCount[p._id] === 0,
                        )
                          ? "text-emerald-600"
                          : "text-muted-foreground",
                      )}
                    />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ConversationGrid({
  conversations,
  userId,
}: {
  conversations: any[];
  userId: string | undefined;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
            <MailOpen className="h-12 w-12 text-emerald-600" />
          </div>
        </div>
        <h3 className="font-semibold text-xl mb-2">Your inbox is empty</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          When you start a conversation with a buyer or seller, it will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id !== userId,
        );
        const isUnread =
          userId && conv.unreadCount && conv.unreadCount[userId] > 0;

        return (
          <Link
            key={conv._id}
            href={`/messages/${conv._id}`}
            className={cn(
              "group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
              isUnread
                ? "border-emerald-500/50 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20"
                : "border-emerald-500/20 bg-white/50 dark:bg-gray-800/50 hover:border-emerald-500/30",
            )}
          >
            {/* Status indicator */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1 transition-all",
                isUnread
                  ? "bg-emerald-500"
                  : "bg-transparent group-hover:bg-emerald-500/30",
              )}
            />

            <CardContent className="p-4 text-center">
              <div className="relative inline-block mx-auto mb-3">
                <Avatar className="h-20 w-20 ring-2 ring-emerald-500/20 shadow-lg">
                  <AvatarImage src={otherParticipant?.image} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xl font-bold">
                    {otherParticipant?.name?.[0] || (
                      <User className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
                {isUnread && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>

              <h3
                className={cn(
                  "font-semibold text-base truncate mb-1",
                  isUnread && "text-emerald-700 dark:text-emerald-400",
                )}
              >
                {otherParticipant?.name || "Unknown User"}
              </h3>

              <p className="text-xs text-muted-foreground truncate mb-2">
                {conv.lastMessage || "Started a conversation"}
              </p>

              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-emerald-500/10">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {conv.lastMessageAt
                    ? formatDistanceToNow(new Date(conv.lastMessageAt), {
                        addSuffix: true,
                      })
                    : "No messages yet"}
                </span>
                {conv.lastMessageSender === userId && (
                  <CheckCheck
                    className={cn(
                      "h-3 w-3",
                      conv.read ? "text-emerald-600" : "text-muted-foreground",
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Link>
        );
      })}
    </div>
  );
}
