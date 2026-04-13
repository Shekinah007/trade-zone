import { NextResponse } from "next/server";
import * as Ably from "ably";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Ably API key not configured" }, { status: 500 });
  }

  try {
    const client = new Ably.Rest(apiKey);
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: session.user.id as string,
    });
    
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Error creating Ably token request:", error);
    return NextResponse.json({ message: "Failed to generate token" }, { status: 500 });
  }
}
