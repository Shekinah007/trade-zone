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

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select item condition"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  country: z.string().min(2, "Country is required"),
  uniqueIdentifier: z
    .string()
    .min(1, "Serial Number / Unique Identifier is required"),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.listing?.title || initialData?.model || "",
      description: initialData?.description || "",
      price: initialData?.listing?.price || 0,
      category: initialData?.listing?.category?._id || initialData?.listing?.category || "",
      condition: initialData?.listing?.condition || "",
      city: initialData?.listing?.location?.city || "",
      state: initialData?.listing?.location?.state || "",
      country: initialData?.listing?.location?.country || "",
      uniqueIdentifier: initialData?.uniqueIdentifier || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (imageItems.length + files.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      const newItems = files.map((file) => ({
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      }));
      setImageItems((prev) => [...prev, ...newItems]);
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

      const url = initialData
        ? `/api/listings/${initialData._id}`
        : "/api/listings";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save listing");
      }

      const data = await res.json();
      toast.success(
        initialData ? "Listing updated!" : "Listing created successfully!",
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
                    Unique Identifier
                    <span className="text-xs text-muted-foreground font-normal">
                      (Serial No., VIN, IMEI, etc.)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SN123456789" {...field} />
                  </FormControl>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3 w-3" />
                    Helps buyers verify and track unique items
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!session?.user?.unlimitedRegistrations && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-400 mt-2">
                <Info className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Registry Notice</p>
                  <p className="text-xs opacity-90 mt-0.5">
                    Your item will not be automatically added to the Global
                    Property Registry because you do not have unlimited
                    registrations. You can manually register items from your
                    dashboard.
                  </p>
                </div>
              </div>
            )}

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
                    className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {imageItems.length < 5 && (
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
            ? initialData
              ? "Saving..."
              : "Posting..."
            : initialData
              ? "Save Changes"
              : "Post Listing"}
        </Button>
      </form>
    </Form>
  );
}
