import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/listings/${id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted bg-card hover:bg-card/50 group rounded-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
           {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/50">
              <span className="text-sm">No Image</span>
            </div>
          )}
          
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-sm bg-background/80 backdrop-blur hover:bg-background hover:text-red-500"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement save functionality
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-medium shadow-sm border-0">
               {condition}
            </Badge>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
        
        <CardContent className="p-5">
            <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center text-xs font-medium text-primary mb-1">
                   <Tag className="h-3 w-3 mr-1" />
                   {category}
                </div>
            </div>
            
            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <p className="font-extrabold text-xl mb-3 text-foreground">
              {formattedPrice}
            </p>
            
            <div className="flex items-center text-xs text-muted-foreground w-full">
               <div className="flex items-center truncate flex-1">
                 <MapPin className="h-3 w-3 mr-1 shrink-0" />
                 <span className="truncate">{location?.city || "Unknown"}, {location?.country || "Loc"}</span>
               </div>
               <span className="shrink-0">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
