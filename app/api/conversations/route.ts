import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import "@/models/User";
import "@/models/Listing";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { listingId, sellerId } = body;

    if (!listingId || !sellerId) {
      return NextResponse.json({ message: "Missing listingId or sellerId" }, { status: 400 });
    }

    if (session.user.id === sellerId) {
       return NextResponse.json({ message: "Cannot message yourself" }, { status: 400 });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [session.user.id, sellerId] },
      listing: listingId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [session.user.id, sellerId],
        listing: listingId,
        unreadCount: {
            [session.user.id as string]: 0,
            [sellerId as string]: 0
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // Find conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: session.user.id
    })
    .populate("participants", "name image")
    .populate("listing", "title images price")
    .sort({ updatedAt: -1 });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
