import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { registrationCreditCost, unlimitedRegistrationPriceNGN } = body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (registrationCreditCost !== undefined) {
      settings.registrationCreditCost = Number(registrationCreditCost);
    }
    
    if (unlimitedRegistrationPriceNGN !== undefined) {
      settings.unlimitedRegistrationPriceNGN = Number(unlimitedRegistrationPriceNGN);
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Error updating settings" },
      { status: 500 },
    );
  }
}
