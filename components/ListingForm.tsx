"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Upload,
  X,
  ImagePlus,
  Tag,
  DollarSign,
  MapPin,
  FileText,
  Info,
  Camera,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

import imageCompression from "browser-image-compression";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select item condition"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  uniqueIdentifier: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
});

interface ListingFormProps {
  initialData?: any;
  categories: any[];
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ListingForm({ initialData, categories }: ListingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageItems, setImageItems] = useState<
    { url: string; file?: File; isNew: boolean }[]
  >(initialData?.images?.map((url: string) => ({ url, isNew: false })) || []);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.listing?.title || initialData?.model || "",
      description: initialData?.description || "",
      price: initialData?.listing?.price || 0,
      category:
        initialData?.listing?.category?._id ||
        initialData?.listing?.category ||
        "",
      condition: initialData?.listing?.condition || "",
      city: initialData?.listing?.location?.city || "",
      state: initialData?.listing?.location?.state || "",
      country: initialData?.listing?.location?.country || "",
      uniqueIdentifier: initialData?.uniqueIdentifier || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageItems.length + files.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      setIsCompressing(true);
      setCompressionProgress(0);
      const progressMap = new Map<number, number>();

      const compressedItems = await Promise.all(
        files.map(async (file, index) => {
          try {
            const compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              onProgress: (p) => {
                progressMap.set(index, p);
                let total = 0;
                progressMap.forEach((val) => {
                  total += val;
                });
                setCompressionProgress(Math.round(total / files.length));
              },
            });
            return {
              url: URL.createObjectURL(compressedFile),
              file: compressedFile,
              isNew: true,
            };
          } catch (error) {
            console.error("Image compression error:", error);
            progressMap.set(index, 100);
            return {
              url: URL.createObjectURL(file),
              file,
              isNew: true,
            };
          }
        }),
      );

      setIsCompressing(false);
      setCompressionProgress(0);
      setImageItems((prev) => [...prev, ...compressedItems]);
    }
  };

  const removeImageItem = (index: number) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
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

      const existingImages = imageItems
        .filter((i) => !i.isNew)
        .map((i) => i.url);
      existingImages.forEach((url) => formData.append("existingImages", url));

      imageItems
        .filter((i) => i.isNew && i.file)
        .forEach((i) => {
          formData.append("images", i.file!);
        });

      const isEditingListing = initialData && initialData.isListed;
      const url = isEditingListing
        ? `/api/listings/${initialData._id}`
        : "/api/listings";
      const method = isEditingListing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Non-JSON response:", text);
        if (res.status === 413) {
          throw new Error("Images are too large. Please upload smaller files.");
        }
        throw new Error(`Server error (${res.status}). Please try again.`);
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to save listing");
      }

      toast.success(
        isEditingListing ? "Listing updated!" : "Listing created successfully!",
      );
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
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Section 1: Item Details */}
        <div>
          <SectionHeader
            icon={Tag}
            title="Item Details"
            description="Give your listing a clear title and category"
          />
          <div className="space-y-4">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.icon} {cat.name}
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
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">🆕 New</SelectItem>
                        <SelectItem value="Like New">✨ Like New</SelectItem>
                        <SelectItem value="Used - Good">
                          👍 Used — Good
                        </SelectItem>
                        <SelectItem value="Used - Fair">
                          👌 Used — Fair
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="uniqueIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    Unique Identifier (optional)
                    <span className="text-xs text-muted-foreground font-normal">
                      (Serial No., VIN, IMEI, etc.)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SN123456789"
                      {...field}
                      disabled={!!initialData?.uniqueIdentifier}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Helps buyers verify and track unique items
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Apple, Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPhone 14 Pro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 2: Description */}
        <div>
          <SectionHeader
            icon={FileText}
            title="Description"
            description="Describe your item honestly and in detail"
          />
          <FormField
            control={form.control as any}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Describe the item's condition, features, what's included, reason for selling..."
                    className="resize-none min-h-[140px]"
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground ml-auto">
                    {field.value?.length || 0} chars
                  </span>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Section 3: Photos & Price */}
        <div>
          <SectionHeader
            icon={ImagePlus}
            title="Photos & Price"
            description="Upload up to 5 photos and set your asking price"
          />

          {/* Images */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Photos</FormLabel>
              <span className="text-xs text-muted-foreground">
                {imageItems.length}/5
              </span>
            </div>
            {/* <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {imageItems.map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
                >
                  <img
                    src={item.url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageItem(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {imageItems.length < 5 && !isCompressing && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group">
                  <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="mt-1.5 text-xs text-muted-foreground group-hover:text-primary">
                    Add Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
              {isCompressing && (
                <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-muted border-dashed bg-muted/20">
                  <Loader2 className="h-5 w-5 text-primary animate-spin mb-2" />
                  <span className="text-xs font-medium text-primary">
                    {compressionProgress}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Optimizing Image(s)...
                  </span>
                </div>
              )}
            </div> */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {imageItems.map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
                >
                  <img
                    src={item.url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImageItem(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {imageItems.length < 5 &&
                (isCompressing ? (
                  <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/20 gap-1">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span className="text-xs font-medium text-primary">
                      {compressionProgress}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Optimizing...
                    </span>
                  </div>
                ) : (
                  <div className="flex aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 overflow-hidden flex-col">
                    {/* Gallery */}
                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group border-b border-dashed border-muted-foreground/20">
                      <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="mt-1 text-[10px] text-muted-foreground group-hover:text-primary">
                        Gallery
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>

                    {/* Camera */}
                    <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-all group">
                      <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="mt-1 text-[10px] text-muted-foreground group-hover:text-primary">
                        Camera
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              First image will be used as the cover photo
            </p>
          </div>

          {/* Price */}
          <FormField
            control={form.control as any}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">
                      ₦
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      placeholder="0.00"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Section 4: Location */}
        <div>
          <SectionHeader
            icon={MapPin}
            title="Location"
            description="Where are you selling from?"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control as any}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Lagos" {...field} />
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
                  <FormLabel>
                    State
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Lagos State" {...field} />
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
                    <Input placeholder="Nigeria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full text-base shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading
            ? initialData && initialData.isListed
              ? "Saving..."
              : "Posting..."
            : initialData && initialData.isListed
              ? "Save Changes"
              : "Post Listing"}
        </Button>
      </form>
    </Form>
  );
}
