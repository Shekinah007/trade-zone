import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/mail";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    
    // We always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we sent a password reset link." },
        { status: 200 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await PasswordResetToken.create({
      email,
      token,
      expiresAt,
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { message: "If an account with that email exists, we sent a password reset link." },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.message },
        { status: 400 }
      );
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
