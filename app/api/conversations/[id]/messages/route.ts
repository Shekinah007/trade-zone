import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const messages = await Message.find({ conversation: params.id })
      .populate("sender", "name image")
      .sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { content } = body;

    const newMessage = await Message.create({
      conversation: params.id,
      sender: session.user.id,
      content,
    });

    await Conversation.findByIdAndUpdate(params.id, {
        lastMessage: content,
        lastMessageAt: new Date(),
        $inc: { [`unreadCount.${session.user.id === params.id ? 'other' : 'unknown'}`]: 1 } // Simplified logic, ideally identify other participant
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
