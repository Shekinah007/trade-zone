"use client";

import { useState } from "react";
import { Pencil, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessEditForm } from "@/components/profile/BusinessEditForm";
import { BusinessView } from "@/components/profile/BusinessView";
import Link from "next/link";

interface BusinessProfileProps {
  initialData: any;
}

export default function BusinessProfile({ initialData }: BusinessProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(initialData);

  return (
    <div className="bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
        <p className="text-sm font-semibold">
          {isEditing ? "Edit Business Profile" : "Business Profile"}
        </p>
        <div className="flex items-center gap-2">
          {!isEditing && data && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full text-muted-foreground"
              asChild
            >
              <Link href={`/store/${data.owner}`}>
                <ExternalLink className="h-3.5 w-3.5" /> View Store
              </Link>
            </Button>
          )}
          <Button
            variant={isEditing ? "ghost" : "outline"}
            size="sm"
            className={`gap-2 rounded-full ${isEditing ? "text-muted-foreground" : ""}`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="h-3.5 w-3.5" /> Cancel
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {isEditing ? (
          <BusinessEditForm
            initialData={data}
            onSuccess={(updated) => {
              setData(updated);
              setIsEditing(false);
            }}
          />
        ) : (
          <BusinessView data={data} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  );
}
