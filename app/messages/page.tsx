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
  MoreVertical,
  Sparkles,
  Shield,
  Crown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(
      (p: any) => p._id !== session?.user?.id
    );
    const matchesSearch = otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "unread") {
      return matchesSearch && !conv.isRead;
    }
    return matchesSearch;
  });

  const unreadCount = conversations.filter(conv => !conv.isRead).length;

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 text-center border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Messages</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to view and manage your conversations with buyers and sellers.
            </p>
            <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Link href="/auth/signin">Sign In to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your conversations with buyers and sellers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                {conversations.length} Conversations
              </Badge>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b bg-gradient-to-r from-emerald-50/30 to-transparent dark:from-emerald-950/20">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="bg-emerald-500/10">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2"
                >
                  <Inbox className="h-4 w-4" />
                  All Messages
                </TabsTrigger>
                <TabsTrigger 
                  value="unread" 
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <ConversationList 
                conversations={filteredConversations} 
                userId={session?.user?.id}
              />
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              <ConversationList 
                conversations={filteredConversations} 
                userId={session?.user?.id}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function ConversationList({ conversations, userId }: { conversations: any[]; userId: string |  undefined }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <MessageSquare className="h-12 w-12 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          When you start a conversation with a buyer or seller, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv, idx) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p._id !== userId
        );
        const isUnread = !conv.isRead;
        
        return (
          <Link 
            key={conv._id} 
            href={`/messages/${conv._id}`}
            className={cn(
              "flex items-center p-4 gap-4 transition-all duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 group relative",
              isUnread && "bg-emerald-50/30 dark:bg-emerald-950/10"
            )}
          >
            {/* Online Status Indicator */}
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-emerald-500/20 shadow-md">
                <AvatarImage src={otherParticipant?.image} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  {otherParticipant?.name?.[0] || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold truncate",
                    isUnread && "text-emerald-700 dark:text-emerald-400"
                  )}>
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
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm truncate max-w-[80%]",
                    isUnread 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                  )}>
                    {conv.lastMessage || "Started a conversation"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {conv.listing && (
                    <Badge variant="outline" className="text-[10px] bg-secondary/50 max-w-[100px] truncate">
                      {conv.listing.title}
                    </Badge>
                  )}
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  {conv.lastMessageSender === userId && (
                    <CheckCheck className={cn(
                      "h-4 w-4",
                      conv.isRead ? "text-emerald-600" : "text-muted-foreground"
                    )} />
                  )}
                </div>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                  <Star className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                  <Archive className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}