"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground mb-4">You need to be logged in to view your messages.</p>
        <Link href="/auth/signin" className="text-primary hover:underline">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
             <MessageSquare className="h-6 w-6" />
             Inbox
          </CardTitle>
          <CardDescription>
            Manage your conversations with buyers and sellers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
               No messages yet. Start a conversation from a listing!
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => {
                // Determine the "other" participant
                const otherParticipant = conv.participants.find(
                  (p: any) => p._id !== session?.user?.id
                );

                return (
                  <Link 
                    key={conv._id} 
                    href={`/messages/${conv._id}`}
                    className="flex items-center p-4 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={otherParticipant?.image} />
                      <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold truncate">
                          {otherParticipant?.name || "Unknown User"}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                             {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                         <p className="text-sm text-muted-foreground truncate max-w-[80%]">
                           {conv.lastMessage || "Started a conversation"}
                         </p>
                         {conv.listing && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full truncate max-w-[120px]">
                               {conv.listing.title}
                            </span>
                         )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
