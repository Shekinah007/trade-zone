"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ChatPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
        router.push("/auth/signin");
    } else if (status === "authenticated") {
        fetchMessages();
        // Optional: Set up polling or websocket here
        const interval = setInterval(fetchMessages, 5000); 
        return () => clearInterval(interval);
    }
  }, [status, params.id]);

  useEffect(() => {
      // Scroll to bottom when messages change
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${params.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/conversations/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto py-6 max-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] flex flex-col">
       <div className="mb-4 flex items-center">
         <Button variant="ghost" size="sm" asChild className="mr-2">
           <Link href="/messages"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
         </Button>
         <h1 className="text-xl font-bold">Chat</h1>
       </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-md bg-background/50 backdrop-blur-sm">
        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
           {messages.length === 0 ? (
               <div className="text-center text-muted-foreground mt-10">Start the conversation!</div>
           ) : (
               messages.map((msg) => {
                   const isMe = msg.sender._id === session?.user?.id;
                   return (
                       <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                               {!isMe && (
                                   <Avatar className="h-8 w-8">
                                       <AvatarImage src={msg.sender.image} />
                                       <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                                   </Avatar>
                               )}
                               <div className={`px-4 py-2 rounded-2xl text-sm ${
                                   isMe 
                                   ? 'bg-primary text-primary-foreground rounded-br-none' 
                                   : 'bg-muted text-foreground rounded-bl-none'
                               }`}>
                                   {msg.content}
                               </div>
                           </div>
                       </div>
                   )
               })
           )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
           <form onSubmit={handleSendMessage} className="flex gap-2">
             <Input 
               value={newMessage} 
               onChange={(e) => setNewMessage(e.target.value)} 
               placeholder="Type a message..." 
               className="flex-1"
             />
             <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
             </Button>
           </form>
        </div>
      </Card>
    </div>
  );
}
