import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // Fetch user with password field (it's select: false in schema)
  const user = await User.findById(session.user.id).select("+password");
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Block OAuth users
  if (user.provider !== "credentials") {
    return NextResponse.json(
      { message: "Password change is not available for accounts signed in with Google or Facebook." },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = await req.json();

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password || "");
  if (!isMatch) {
    return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
  }

  // Hash and save new password
  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  await user.save();

  return NextResponse.json({ message: "Password updated successfully" });
}