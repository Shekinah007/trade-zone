import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";

export async function GET() {
  try {
    await dbConnect();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return NextResponse.json({
      success: true,
      registrationCreditCost: settings.registrationCreditCost,
      unlimitedRegistrationPriceNGN: settings.unlimitedRegistrationPriceNGN,
    });
  } catch (error: any) {
    console.error("Public settings GET error:", error);
    return NextResponse.json(
      { error: "Error fetching settings" },
      { status: 500 },
    );
  }
}
