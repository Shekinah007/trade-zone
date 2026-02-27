import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import * as z from "zod";
import { writeFile } from "fs/promises";
import path from "path";

const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  // image handled separately
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const imageFile = formData.get("image") as File | null;

    const validatedFields = updateProfileSchema.safeParse({ name, phone });

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validatedFields.error.message },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const updateData: any = {
      name: validatedFields.data.name,
      phone: validatedFields.data.phone,
    };

    if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
  
        // Create unique filename
        const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`;
        const uploadDir = path.join(process.cwd(), "public/uploads");
        
        // Ensure directory exists (you might want to use fs.mkdir with recursive: true separately if not guaranteed)
        // For now relying on existing uploads folder or simple error if missing
        
        await writeFile(path.join(uploadDir, filename), buffer);
        updateData.image = `/uploads/${filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 }
    );
  }
}
