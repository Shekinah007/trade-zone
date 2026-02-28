import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Business from "@/models/Business";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await dbConnect();

  const business = await Business.findOneAndUpdate(
    { owner: session.user.id },
    {
      $set: {
        name: body.name,
        type: body.type,
        description: body.description,
        email: body.email,
        phone: body.phone,
        address: body.address,
        businessHours: body.businessHours,
        image: body.image,
        qrCode: body.qrCode,
        categories: body.categories || [],
        socials: body.socials || [],
        bankDetails: body.bankDetails || [],
        certifications: body.certifications || [],
      },
    },
    { new: true, upsert: true },
  );

  return NextResponse.json(business);
}
