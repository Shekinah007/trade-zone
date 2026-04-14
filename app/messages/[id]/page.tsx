"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  Loader2, 
  ArrowLeft, 
  MessageCircle, 
  User, 
  CheckCheck, 
  Clock,
  Phone,
  Video,
  MoreVertical,
  Search,
  Smile,
  Paperclip,
  Mic,
  Shield,
  Crown,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as Ably from "ably";
import { useParams } from "next/navigation";
import { format } from "date-fns";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    
    if (status === "authenticated" && id) {
      fetchMessages();
      fetchConversationDetails();

      // Initialize Ably
      const ably = new Ably.Realtime({ authUrl: "/api/ably/auth" });
      const channel = ably.channels.get(`conversation-${id}`);

      channel.subscribe("message", (message) => {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message.data._id);
          if (exists) return prev;
          return [...prev, message.data];
        });
      });

      channel.subscribe("typing", () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });

      return () => {
        channel.unsubscribe("message");
        channel.unsubscribe("typing");
        ably.close();
      };
    }
  }, [status, id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Mark conversation as read after fetching messages
        await fetch(`/api/conversations/${id}/read`, { method: "POST" }).catch(console.error);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationDetails = async () => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOtherUser(data.otherUser);
      }
    } catch (error) {
      console.error("Failed to fetch conversation details", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleTyping = () => {
    // Emit typing event via Ably
    const ably = new Ably.Realtime({ authUrl: "/api/ably/auth" });
    const channel = ably.channels.get(`conversation-${id}`);
    channel.publish("typing", { userId: session?.user?.id });
    ably.close();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0 bg-emerald-200 md:bg-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto  max-w-6xl  h-[calc(100vh-72px)] flex flex-col">
        {/* Chat Header */}
    <Card className="p-1 rounded-none border-0  bg-transparent shadow-none dark:bg-gray-900/80">
      <div className="px-3 py-2 flex items-center gap-2">
    <Button variant="ghost" size="sm" asChild className="h-7 px-2 hover:bg-emerald-100">
      <Link href="/messages">
        <ArrowLeft className="h-3.5 w-3.5" />
      </Link>
    </Button>
    
    <Separator orientation="vertical" className="h-5" />
    
    <Avatar className="h-8 w-8 ring-1 ring-emerald-500/20">
      <AvatarImage src={otherUser?.image} />
      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
        {otherUser?.name?.[0] || "U"}
      </AvatarFallback>
    </Avatar>
    
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-xs">{otherUser?.name || "User"}</span>
        {otherUser?.isVerified && (
          <Shield className="h-3 w-3 text-emerald-600" />
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] text-muted-foreground">Online</span>
        {isTyping && (
          <>
            <span className="text-[9px] text-muted-foreground">•</span>
            <span className="text-[9px] text-emerald-600 animate-pulse">typing...</span>
          </>
        )}
      </div>
    </div>
  </div>
</Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col bg-white overflow-y-auto border-0 shadow-none py-0 dark:bg-gray-900/80 backdrop-blur-sm">
          <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start a conversation with {otherUser?.name || "the user"} by sending a message below.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender._id === session?.user?.id;
                const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();
                
                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <Badge variant="secondary" className="text-xs bg-muted/50 backdrop-blur-sm">
                          {format(new Date(msg.createdAt), "EEEE, MMMM d, yyyy")}
                        </Badge>
                      </div>
                    )}
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                        {!isMe && (
                          <Avatar className="h-8 w-8 ring-2 ring-emerald-500/20">
                            <AvatarImage src={msg.sender.image} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                              {msg.sender.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="relative">
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all duration-200",
                            isMe 
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none hover:shadow-md" 
                              : "bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none hover:shadow-md"
                          )}>
                            {msg.content}
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 mt-1 text-[10px] text-muted-foreground",
                            isMe ? "justify-end" : "justify-start"
                          )}>
                            <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                            {isMe && (
                              <CheckCheck className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              {/* <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              >
                <Paperclip className="h-4 w-4" />
              </Button> */}
              {/* <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
              >
                <Smile className="h-4 w-4" />
              </Button> */}
              <Input 
                ref={inputRef}
                value={newMessage} 
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }} 
                placeholder="Type a message..." 
                className="flex-1 border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim()}
                className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}