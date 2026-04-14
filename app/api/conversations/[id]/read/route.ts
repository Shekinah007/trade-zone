import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await context.params;

  try {
    await dbConnect();

    // Update the unreadCount for the current user in the conversation to 0
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${session.user.id}`]: 0 }
    });

    // Mark all unread messages from other users as read in this conversation
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: session.user.id }, 
        read: false 
      },
      { 
        $set: { read: true } 
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark conversation as read:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
