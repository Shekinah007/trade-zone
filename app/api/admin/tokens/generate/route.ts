import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import RechargeToken from "@/models/RechargeToken";
import crypto from "crypto";

function generateRandomCode() {
  const bytes = crypto.randomBytes(5); // 5 bytes = 10 hex chars
  return "FM" + bytes.toString("hex").toUpperCase().substring(0, 8); // FM + 8 chars
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { tokenType, quantity, batchId, notes, expiryDays, creditValue } = body;

    if (!tokenType || !["basic", "unlimited", "credit"].includes(tokenType)) {
      return NextResponse.json({ error: "Invalid tokenType" }, { status: 400 });
    }

    if (!quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 1000" },
        { status: 400 },
      );
    }

    let value = creditValue || 10;
    if (tokenType === "unlimited") value = 9999;
    else if (tokenType === "basic" && !creditValue) value = 10;
    
    const expDays = expiryDays || 365;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expDays);

    const tokensToCreate = [];

    // Generate unique codes
    for (let i = 0; i < quantity; i++) {
      let code = generateRandomCode();
      tokensToCreate.push({
        code,
        tokenType,
        value,
        status: "active",
        generatedBy: session.user.id,
        expiresAt,
        batchId: batchId || undefined,
        notes: notes || undefined,
      });
    }

    const createdTokens = await RechargeToken.insertMany(tokensToCreate);

    return NextResponse.json({
      success: true,
      count: createdTokens.length,
      tokens: createdTokens,
    });
  } catch (error: any) {
    console.error("Token generate error:", error);
    return NextResponse.json(
      { error: error.message || "Error generating tokens" },
      { status: 500 },
    );
  }
}
