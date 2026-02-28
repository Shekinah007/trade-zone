import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      status: "pending",
    });

    const externalData: any = await fetch(
      `${process.env.ACD_API}/users/${user.email}`,
    );
    const { data } = await externalData.json();

    if (data.business) {
      await Business.create({
        owner: user._id,
        name: data.business.businessName || user.name,
        description: data.business.description,
        phone: data.business.phone,
        email: data.business.email,
        address: data.business.address,
        type: data.business.type,
        image: data.business.logo,
        categories: data.business.categories || [],
        socials: data.business.socials || [],
        bankDetails: data.business.bankDetails || [],
        certifications: data.business.certifications || [],
        businessHours: data.business.businessHours,
      });
    } else {
      // If no business data is returned from ACD API, create a default business for the user
      await Business.create({
        owner: user._id,
        name: user.name, // Default to user's name
        email: user.email,
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 },
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.message },
        { status: 400 },
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
