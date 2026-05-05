import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import RechargeToken from "@/models/RechargeToken";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    let { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Token code is required" },
        { status: 400 },
      );
    }

    code = code.trim().toUpperCase();

    // Fetch token
    const token = await RechargeToken.findOne({ code });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid token code" },
        { status: 404 },
      );
    }

    if (token.status !== "active") {
      if (token.status === "used") {
        return NextResponse.json(
          { error: `This token has already been used` },
          { status: 400 },
        );
      }
      if (token.status === "expired") {
        return NextResponse.json(
          { error: `This token has already expired` },
          { status: 400 },
        );
      }
      if (token.status === "revoked") {
        return NextResponse.json(
          { error: `This token has been revoked` },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: `Token is invalid` }, { status: 400 });
    }

    if (new Date() > new Date(token.expiresAt)) {
      token.status = "expired";
      await token.save();
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Atomic update to avoid race conditions
    const updatedToken = await RechargeToken.findOneAndUpdate(
      { _id: token._id, status: "active" },
      { $set: { status: "used", usedBy: session.user.id, usedAt: new Date() } },
      { new: true },
    );

    if (!updatedToken) {
      return NextResponse.json(
        { error: "Token was already used or revoked" },
        { status: 400 },
      );
    }

    // Now update the user
    let userUpdate: any = {
      $inc: { totalTokensRedeemed: 1 },
      $push: {
        tokensUsed: {
          tokenId: updatedToken._id,
          usedAt: updatedToken.usedAt,
          tokenType: updatedToken.tokenType,
          value: updatedToken.value,
        },
      },
    };

    if (updatedToken.tokenType === "unlimited") {
      userUpdate.$set = { unlimitedRegistrations: true };
    } else {
      userUpdate.$inc.creditBalance = updatedToken.value;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      userUpdate,
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Token redeemed successfully",
      tokenType: updatedToken.tokenType,
      newCreditBalance: updatedUser?.creditBalance,
      unlimited: updatedUser?.unlimitedRegistrations,
    });
  } catch (error: any) {
    console.error("Token redeem error:", error);
    return NextResponse.json(
      { error: error.message || "Error redeeming token" },
      { status: 500 },
    );
  }
}
