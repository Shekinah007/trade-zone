"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select item condition"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  uniqueIdentifier: z.string().min(1, "Serial Number / Unique Identifier is required"),
});

interface ListingFormProps {
  initialData?: any;
  categories: any[];
}

export function ListingForm({ initialData, categories }: ListingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
  // Keep track of existing images to keep vs new images to upload
  // For simplicity in this iteration, we might handle mixed updates by just appending new ones 
  // or replacing. But the API might expect a full list or delta.
  // Let's implement a simple strategy: 
  // `previews` tracks what is shown. 
  // If it's a URL (string), it's an existing image.
  // If it's a File object (not directly in preview string array but implied), we ignore for now,
  // we rely on `images` state for NEW files.
  // However, we need to know which EXISTING images were kept.

  // Actually, to properly handle edits with image deletion:
  // We need to send the list of 'kept' image URLs + new files.

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      category: initialData?.category?._id || initialData?.category || "",
      condition: initialData?.condition || "",
      city: initialData?.location?.city || "",
      state: initialData?.location?.state || "",
      country: initialData?.location?.country || "",
      uniqueIdentifier: initialData?.uniqueIdentifier || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // We need to differentiate between removing an existing image and a newly added one.
    // 'previews' contains both URLs (existing) and Blob URLs (new).

    // If we simply remove by index from 'previews', visual is correct.
    // But we need to sync 'images' (new files) and efficient backend update.

    // Let's figure out if the removed index corresponds to an existing image or a new file.
    // We know 'initialData.images' count.

    const existingCount = initialData?.images?.length || 0;
    // Wait, this logic is tricky if we don't track them separately. 
    // Let's just remove from previews. 
    // And when submitting, we filter previews: if starts with 'blob:', it's new (in `images`), else it's existing.
    // Actually `images` state only holds NEW files. matching index is hard.

    // Improved logic:
    // Store `visibleImages` as objects { type: 'url' | 'file', url: string, file?: File }

    // For now, to stick to the plan without overcomplicating in one step, let's try a simpler approach if possible.
    // But mixed image sources is common headache.

    // New strategy:
    // `previews` is the source of truth for what to show.
    // We also need to know which *files* correspond to which preview if it is a new file.

    // Let's just restart `images` state to be clear.
    // We won't use `images` state for submission directly. 
    // We will use `previews` to determine what to keep (existing URLs).
    // And we need a way to map new blob URLs back to Files.

    // Let's use a ref or just strictly map them? 
    // Simplest: `files` array that matches `previews` length? No, existing images don't have Files.

    // Let's go with:
    // `existingImages` = string[] (urls)
    // `newFiles` = File[]

    // When removing, we need to know which one we removed.
    // Let's store objects in `previews`: { url: string, file?: File, isNew: boolean }

    // But `ListingForm` refactor is the goal.
    // I will implement the object strategy for robust handling.

    // Refactoring...
  };

  // Re-implementation of image state for Edit support
  const [imageItems, setImageItems] = useState<{ url: string; file?: File; isNew: boolean }[]>(
    initialData?.images?.map((url: string) => ({ url, isNew: false })) || []
  );

  const handleImageChangeNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map(file => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true
      }));
      setImageItems(prev => [...prev, ...newItems]);
    }
  };

  const removeImageItem = (index: number) => {
    setImageItems(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (imageItems.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Append existing images that are kept
      const existingImages = imageItems.filter(item => !item.isNew).map(item => item.url);
      existingImages.forEach(url => formData.append("existingImages", url));

      // Append new files
      const newFiles = imageItems.filter(item => item.isNew).map(item => item.file);
      newFiles.forEach((file) => {
        if (file) formData.append("images", file);
      });

      const url = initialData ? `/api/listings/${initialData._id}` : "/api/listings";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save listing");
      }

      const data = await res.json();
      toast.success(initialData ? "Listing updated!" : "Listing created successfully!");
      router.push(`/listings/${data._id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">

        <FormField
          control={form.control as any}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What are you selling?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="uniqueIdentifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unique Identifier (Serial Number, VIN, IMEI, etc.)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. SN123456789" {...field} />
              </FormControl>
              <FormDescription>
                This identifier helps track and verify unique items.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control as any}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₦)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Used - Good">Used - Good</SelectItem>
                    <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your item in detail..."
                  className="resize-none"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Images</FormLabel>
          <div className="mt-2 grid grid-cols-3 gap-4 md:grid-cols-4">
            {imageItems.map((item, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                <img src={item.url} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImageItem(index)}
                  className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/50 hover:bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-xs text-muted-foreground">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChangeNew}
              />
            </label>
          </div>
          <FormDescription>
            Upload up to 5 images.
          </FormDescription>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <FormField
            control={form.control as any}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as any}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Post Listing"}
        </Button>
      </form>
    </Form>
  );
}
