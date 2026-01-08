import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

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
  id,
  title,
  price,
  image,
  category,
  condition,
  location,
  createdAt,
}: ListingCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  return (
    <Link href={`/listings/${id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg group">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
           {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full opacity-90 backdrop-blur-sm hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement save functionality
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="opacity-90">{condition}</Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
             <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <p className="font-bold text-lg text-primary">{formattedPrice}</p>
          <p className="text-xs text-muted-foreground mb-2">{category}</p>
          
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{location?.city || "Unknown"}, {location?.country || "Loc"}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
           <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
