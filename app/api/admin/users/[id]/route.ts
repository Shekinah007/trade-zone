import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import User from "@/models/User";
import Item from "@/models/Item";
import Business from "@/models/Business";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import SavedItem from "@/models/SavedItem";
import FeaturedWaitlist from "@/models/FeaturedWaitlist";
import Review from "@/models/Review";
import Report from "@/models/Report";
import TransferRequest from "@/models/TransferRequest";
import PasswordResetToken from "@/models/PasswordResetToken";
import SearchLog from "@/models/SearchLog";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await dbConnect();

  const [user, listings] = await Promise.all([
    User.findById(id).lean(),
    Item.find({ owner: id, isListed: true }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify({ user, listings })));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await dbConnect();

  const updated = await User.findByIdAndUpdate(id, body, { new: true }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(updated)));
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Guard: cannot delete yourself
  if (id === session.user.id)
    return NextResponse.json(
      { message: "Cannot delete your own account" },
      { status: 403 }
    );

  try {
    await dbConnect();

    const user = await User.findById(id).lean();
    if (!user)
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );

    // Guard: cannot delete other admins
    if (user.role === "admin")
      return NextResponse.json(
        { message: "Cannot delete admin accounts" },
        { status: 403 }
      );

    const userId = user._id;
    const userEmail = user.email;

    // 1. Delete Cloudinary images for all items owned by this user
    const items = await Item.find({ owner: userId }).lean();
    const allImageUrls = items.flatMap((item) => item.images || []);

    if (allImageUrls.length > 0) {
      const extractPublicId = (url: string) => {
        try {
          const splitUrl = url.split("/upload/");
          if (splitUrl.length < 2) return null;
          let path = splitUrl[1];
          if (path.match(/^v\d+\//)) {
            path = path.replace(/^v\d+\//, "");
          }
          const lastDotIndex = path.lastIndexOf(".");
          if (lastDotIndex !== -1) {
            path = path.substring(0, lastDotIndex);
          }
          return path;
        } catch {
          return null;
        }
      };

      const deletePromises = allImageUrls.map((url: string) => {
        const publicId = extractPublicId(url);
        if (publicId) {
          return new Promise((resolve) => {
            cloudinary.uploader.destroy(
              publicId,
              (error: any, result: any) => {
                if (error) console.error("Cloudinary delete error:", error);
                resolve(result);
              }
            );
          });
        }
        return Promise.resolve();
      });

      await Promise.all(deletePromises);
    }

    // 2. Delete all items owned by user
    await Item.deleteMany({ owner: userId });

    // 3. Delete business profile
    await Business.deleteOne({ owner: userId });

    // 4. Find conversations and delete messages + conversations
    const conversations = await Conversation.find({
      participants: userId,
    })
      .select("_id")
      .lean();
    const conversationIds = conversations.map((c) => c._id);

    if (conversationIds.length > 0) {
      await Message.deleteMany({
        conversation: { $in: conversationIds },
      });
    }
    await Conversation.deleteMany({ participants: userId });

    // 5. Delete user notifications
    await Notification.deleteMany({ userId });

    // 6. Delete saved items
    await SavedItem.deleteMany({ user: userId });

    // 7. Delete featured waitlist entries
    await FeaturedWaitlist.deleteMany({ user: userId });

    // 8. Delete reviews by or about this user
    await Review.deleteMany({
      $or: [{ reviewer: userId }, { reviewee: userId }],
    });

    // 9. Delete reports filed by this user
    await Report.deleteMany({ reporter: userId });

    // 10. Cancel pending transfer requests involving this user
    await TransferRequest.updateMany(
      {
        $or: [{ fromUser: userId }, { toUser: userId }],
        status: "pending",
      },
      { $set: { status: "cancelled" } }
    );

    // 11. Delete password reset tokens for this user's email
    await PasswordResetToken.deleteMany({ email: userEmail });

    // 12. Nullify search log user refs (optional field)
    await SearchLog.updateMany(
      { user: userId },
      { $unset: { user: "" } }
    );

    // 13. Delete the user document last
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user" },
      { status: 500 }
    );
  }
}