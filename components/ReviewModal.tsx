"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewModalProps {
  listingId: string;
  sellerId: string;
}

export function ReviewModal({ listingId, sellerId }: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
        toast.error("Please write a comment");
        return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          revieweeId: sellerId,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        toast.success("Review submitted successfully");
        setOpen(false);
        setRating(0);
        setComment("");
      } else {
        toast.error("Failed to submit review");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Write a Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this Transaction</DialogTitle>
          <DialogDescription>
            Share your experience with the seller.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4 space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  rating >= value ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="How was your experience?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
