import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import SystemSettings from "@/models/SystemSettings";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    const cost = settings.registrationCreditCost;

    if (user.creditBalance < cost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    // Deduct credits and add registration limit
    user.creditBalance -= cost;
    user.registrationLimit = (user.registrationLimit || 0) + 1;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Registration quota purchased successfully",
      newCreditBalance: user.creditBalance,
      newRegistrationLimit: user.registrationLimit,
    });
  } catch (error: any) {
    console.error("Buy quota error:", error);
    return NextResponse.json(
      { error: error.message || "Error purchasing quota" },
      { status: 500 },
    );
  }
}
