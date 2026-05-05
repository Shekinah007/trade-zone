import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import RechargeToken from "@/models/RechargeToken";
import crypto from "crypto";

function generateRandomCode() {
  const bytes = crypto.randomBytes(5);
  return "FM" + bytes.toString("hex").toUpperCase().substring(0, 8);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { tokenType, quantity, batchName, creditValue } = body;

    if (!tokenType || !["basic", "unlimited", "credit"].includes(tokenType)) {
      return NextResponse.json({ error: "Invalid tokenType" }, { status: 400 });
    }

    if (!quantity || quantity < 1 || quantity > 5000) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 5000" },
        { status: 400 },
      );
    }

    let value = creditValue || 10;
    if (tokenType === "unlimited") value = 9999;
    else if (tokenType === "basic" && !creditValue) value = 10;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    const tokensToCreate = [];

    for (let i = 0; i < quantity; i++) {
      tokensToCreate.push({
        code: generateRandomCode(),
        tokenType,
        value,
        status: "active",
        generatedBy: session.user.id,
        expiresAt,
        batchId: batchName || undefined,
      });
    }

    const createdTokens = await RechargeToken.insertMany(tokensToCreate);

    // Create CSV
    const csvHeader = "Code,Type,Value,ExpiresAt\n";
    const csvRows = createdTokens
      .map(
        (t) =>
          `${t.code},${t.tokenType},${t.value},${t.expiresAt.toISOString()}`,
      )
      .join("\n");
    const csvData = csvHeader + csvRows;

    return NextResponse.json({
      success: true,
      count: createdTokens.length,
      csvData: csvData,
    });
  } catch (error: any) {
    console.error("Token bulk generate error:", error);
    return NextResponse.json(
      { error: error.message || "Error generating tokens" },
      { status: 500 },
    );
  }
}
