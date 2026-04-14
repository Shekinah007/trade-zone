import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import * as Ably from "ably";

export async function GET(
  req: Request,
    context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const {id} = await context.params;

  try {
    await dbConnect();
    
    const messages = await Message.find({ conversation: id })
      .populate("sender", "name image")
      .sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
    context: { params: Promise<{ id: string }> }

) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const {id} = await context.params;

  try {
    await dbConnect();
    const body = await req.json();
    const { content } = body;

    const newMessage = await Message.create({
      conversation: id,
      sender: session.user.id,
      content,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name image"
    );

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }

    const incUpdates: Record<string, number> = {};
    conversation.participants.forEach((p: any) => {
      if (p.toString() !== session.user.id) {
        incUpdates[`unreadCount.${p.toString()}`] = 1;
      }
    });

    await Conversation.findByIdAndUpdate(id, {
        lastMessage: content,
        lastMessageAt: new Date(),
        $inc: incUpdates
    });

    // Publish to Ably if API key is present
    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = ably.channels.get(`conversation-${id}`);
      await channel.publish("message", populatedMessage);
    }

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error("Message POST error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
