import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import "@/models/User";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  try {
    await dbConnect();
    
    const conversation = await Conversation.findById(id).populate("participants", "name image isVerified");
    
    if (!conversation) {
        return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
    }

    const otherUser = conversation.participants.find(
      (p: any) => p._id.toString() !== session.user.id
    );

    return NextResponse.json({ 
        ...conversation.toObject(), 
        otherUser 
    });
  } catch (error) {
    console.error("Fetch conversation details error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
