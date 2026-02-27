"use client"

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "./SavedButton";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  condition: string;
  location: { city: string; country: string };
  createdAt: string;
}

export function ListingCard({
  id, title, price, image, category,
  condition, location, createdAt,
}: ListingCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/listings/${id}`} className="block group">
      <div className="rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 text-xs">
              No Image
            </div>
          )}

          {/* Condition badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-[10px] px-1.5 py-0.5 border-0 shadow-sm">
              {condition}
            </Badge>
          </div>

          {/* Save button */}
          <div className="absolute top-2 right-2  group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.preventDefault()}>
            <SaveButton listingId={id} />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-3 space-y-1.5">
          {/* Category */}
          {/* <p className="text-[10px] font-semibold text-primary uppercase tracking-wide truncate">
            {category}
          </p> */}

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Price */}
          <p className="font-bold text-base text-foreground">
            {formattedPrice}
          </p>

          {/* Location + time */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{location?.city || "Unknown"}</span>
            </span>
            <span className="shrink-0 ml-1">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}