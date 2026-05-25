import { Metadata } from "next";
import dbConnect from "@/lib/db";
import Item from "@/models/Item";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await dbConnect();
    const item = await Item.findById(id).lean();
    if (!item) return {};

    const title = `${item.brand} ${item.model}`;
    const statusText = item.ownershipStatus === "missing" ? "STOLEN/MISSING" : "Registered";
    
    return {
      title: `${title} (${statusText}) — FindMaster Registry`,
      description: `View registry details for ${title}. Ownership status: ${statusText}. Verify property ownership on FindMaster.`,
      alternates: { canonical: `/registry/${id}` },
      openGraph: {
        title: `${title} (${statusText}) — FindMaster Registry`,
        description: `View registry details for ${title}. Ownership status: ${statusText}.`,
        url: `/registry/${id}`,
      },
    };
  } catch (e) {
    return {};
  }
}

export default function RegistryItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
