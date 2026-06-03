// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Loader2,
//   Upload,
//   X,
//   ImagePlus,
//   Tag,
//   DollarSign,
//   MapPin,
//   FileText,
//   Info,
//   Camera,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";

// import imageCompression from "browser-image-compression";
// import Tiptap from "./Tiptap";

// const formSchema = z.object({
//   title: z.string().min(5, "Title must be at least 5 characters"),
//   description: z.string().min(20, "Description must be at least 20 characters"),
//   price: z.coerce.number().min(0, "Price must be a positive number"),
//   category: z.string().min(1, "Please select a category"),
//   condition: z.string().min(1, "Please select item condition"),
//   city: z.string().min(2, "City is required"),
//   state: z.string().optional(),
//   country: z.string().min(2, "Country is required"),
//   uniqueIdentifier: z.string().optional(),
//   brand: z.string().optional(),
//   model: z.string().optional(),
// });

// interface ListingFormProps {
//   initialData?: any;
//   categories: any[];
// }

// function SectionHeader({
//   icon: Icon,
//   title,
//   description,
// }: {
//   icon: any;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="flex items-start gap-3 mb-5">
//       <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
//         <Icon className="h-4 w-4" />
//       </div>
//       <div>
//         <p className="font-semibold text-sm">{title}</p>
//         <p className="text-xs text-muted-foreground">{description}</p>
//       </div>
//     </div>
//   );
// }

// export function ListingForm({ initialData, categories }: ListingFormProps) {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageItems, setImageItems] = useState<
//     { url: string; file?: File; isNew: boolean }[]
//   >(initialData?.images?.map((url: string) => ({ url, isNew: false })) || []);
//   const [isCompressing, setIsCompressing] = useState(false);
//   const [compressionProgress, setCompressionProgress] = useState(0);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema) as any,
//     defaultValues: {
//       title: initialData?.listing?.title || initialData?.model || "",
//       description: initialData?.description || "",
//       price: initialData?.listing?.price || 0,
//       category:
//         initialData?.listing?.category?._id ||
//         initialData?.listing?.category ||
//         "",
//       condition: initialData?.listing?.condition || "",
//       city: initialData?.listing?.location?.city || "",
//       state: initialData?.listing?.location?.state || "",
//       country: initialData?.listing?.location?.country || "",
//       uniqueIdentifier: initialData?.uniqueIdentifier || "",
//       brand: initialData?.brand || "",
//       model: initialData?.model || "",
//     },
//   });

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       if (imageItems.length + files.length > 5) {
//         toast.error("Maximum 5 images allowed");
//         return;
//       }

//       setIsCompressing(true);
//       setCompressionProgress(0);
//       const progressMap = new Map<number, number>();

//       const compressedItems = await Promise.all(
//         files.map(async (file, index) => {
//           try {
//             const compressedFile = await imageCompression(file, {
//               maxSizeMB: 1,
//               maxWidthOrHeight: 1920,
//               useWebWorker: true,
//               onProgress: (p) => {
//                 progressMap.set(index, p);
//                 let total = 0;
//                 progressMap.forEach((val) => {
//                   total += val;
//                 });
//                 setCompressionProgress(Math.round(total / files.length));
//               },
//             });
//             return {
//               url: URL.createObjectURL(compressedFile),
//               file: compressedFile,
//               isNew: true,
//             };
//           } catch (error) {
//             console.error("Image compression error:", error);
//             progressMap.set(index, 100);
//             return {
//               url: URL.createObjectURL(file),
//               file,
//               isNew: true,
//             };
//           }
//         }),
//       );

//       setIsCompressing(false);
//       setCompressionProgress(0);
//       setImageItems((prev) => [...prev, ...compressedItems]);
//     }
//   };

//   const removeImageItem = (index: number) => {
//     setImageItems((prev) => prev.filter((_, i) => i !== index));
//   };

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     if (imageItems.length === 0) {
//       toast.error("Please upload at least one image");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       Object.entries(values).forEach(([key, value]) => {
//         formData.append(key, value.toString());
//       });

//       const existingImages = imageItems
//         .filter((i) => !i.isNew)
//         .map((i) => i.url);
//       existingImages.forEach((url) => formData.append("existingImages", url));

//       imageItems
//         .filter((i) => i.isNew && i.file)
//         .forEach((i) => {
//           formData.append("images", i.file!);
//         });

//       const isEditingListing = initialData && initialData.isListed;
//       const url = isEditingListing
//         ? `/api/listings/${initialData._id}`
//         : "/api/listings";
//       const method = isEditingListing ? "PUT" : "POST";

//       const res = await fetch(url, { method, body: formData });

//       let data;
//       const text = await res.text();
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         console.error("Non-JSON response:", text);
//         if (res.status === 413) {
//           throw new Error("Images are too large. Please upload smaller files.");
//         }
//         throw new Error(`Server error (${res.status}). Please try again.`);
//       }

//       if (!res.ok) {
//         throw new Error(data.message || data.error || "Failed to save listing");
//       }

//       toast.success(
//         isEditingListing ? "Listing updated!" : "Listing created successfully!",
//       );
//       router.push(`/listings/${data._id}`);
//       router.refresh();
//     } catch (error: any) {
//       toast.error(error.message || "Something went wrong.");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
//         {/* Section 1: Item Details */}
//         <div>
//           <SectionHeader
//             icon={Tag}
//             title="Item Details"
//             description="Give your listing a clear title and category"
//           />
//           <div className="space-y-4">
//             <FormField
//               control={form.control as any}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Title</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control as any}
//                 name="category"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Category</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a category" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {categories.map((cat) => (
//                           <SelectItem key={cat._id} value={cat._id}>
//                             {cat.icon} {cat.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control as any}
//                 name="condition"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Condition</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select condition" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="New">🆕 New</SelectItem>
//                         <SelectItem value="Like New">✨ Like New</SelectItem>
//                         <SelectItem value="Used - Good">
//                           👍 Used — Good
//                         </SelectItem>
//                         <SelectItem value="Used - Fair">
//                           👌 Used — Fair
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control as any}
//               name="uniqueIdentifier"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="flex items-center gap-1.5">
//                     Unique Identifier (optional)
//                     <span className="text-xs text-muted-foreground font-normal">
//                       (Serial No., VIN, IMEI, etc.)
//                     </span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="e.g. SN123456789"
//                       {...field}
//                       disabled={!!initialData?.uniqueIdentifier}
//                     />
//                   </FormControl>
//                   <FormDescription className="flex items-center gap-1 text-xs">
//                     <Info className="h-3 w-3" />
//                     Helps buyers verify and track unique items
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control as any}
//                 name="brand"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Brand (Optional)</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g. Apple, Toyota" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control as any}
//                 name="model"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Model (Optional)</FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g. iPhone 14 Pro" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Section 2: Description */}
//         <div>
//           <SectionHeader
//             icon={FileText}
//             title="Description"
//             description="Describe your item honestly and in detail"
//           />
//           <FormField
//             control={form.control as any}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Tiptap
//                     value={field.value}
//                     onChange={field.onChange}
//                   />
//                 </FormControl>
//                 <div className="flex items-center justify-between">
//                   <FormMessage />
//                   <span className="text-xs text-muted-foreground ml-auto">
//                     {field.value?.length || 0} chars
//                   </span>
//                 </div>
//               </FormItem>
//             )}
//           />
//         </div>

//         <Separator />

//         {/* Section 3: Photos & Price */}
//         <div>
//           <SectionHeader
//             icon={ImagePlus}
//             title="Photos & Price"
//             description="Upload up to 5 photos and set your asking price"
//           />

//           {/* Images */}
//           <div className="mb-5">
//             <div className="flex items-center justify-between mb-2">
//               <FormLabel>Photos</FormLabel>
//               <span className="text-xs text-muted-foreground">
//                 {imageItems.length}/5
//               </span>
//             </div>
//             {/* <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
//               {imageItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
//                 >
//                   <img
//                     src={item.url}
//                     alt="Preview"
//                     className="h-full w-full object-cover"
//                   />
//                   {index === 0 && (
//                     <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
//                       Cover
//                     </span>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => removeImageItem(index)}
//                     className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 group-hover:opacity-100 transition-opacity hover:bg-destructive"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ))}

//               {imageItems.length < 5 && !isCompressing && (
//                 <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group">
//                   <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
//                   <span className="mt-1.5 text-xs text-muted-foreground group-hover:text-primary">
//                     Add Photo
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     className="hidden"
//                     onChange={handleImageChange}
//                   />
//                 </label>
//               )}
//               {isCompressing && (
//                 <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-muted border-dashed bg-muted/20">
//                   <Loader2 className="h-5 w-5 text-primary animate-spin mb-2" />
//                   <span className="text-xs font-medium text-primary">
//                     {compressionProgress}%
//                   </span>
//                   <span className="text-[10px] text-muted-foreground mt-0.5">
//                     Optimizing Image(s)...
//                   </span>
//                 </div>
//               )}
//             </div> */}
//             <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
//               {imageItems.map((item, index) => (
//                 <div
//                   key={index}
//                   className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
//                 >
//                   <img
//                     src={item.url}
//                     alt="Preview"
//                     className="h-full w-full object-cover"
//                   />
//                   {index === 0 && (
//                     <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full font-medium">
//                       Cover
//                     </span>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => removeImageItem(index)}
//                     className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
//                   >
//                     <X className="h-3.5 w-3.5" />
//                   </button>
//                 </div>
//               ))}

//               {imageItems.length < 5 &&
//                 (isCompressing ? (
//                   <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-muted/20 gap-1">
//                     <Loader2 className="h-5 w-5 text-primary animate-spin" />
//                     <span className="text-xs font-medium text-primary">
//                       {compressionProgress}%
//                     </span>
//                     <span className="text-[10px] text-muted-foreground">
//                       Optimizing...
//                     </span>
//                   </div>
//                 ) : (
//                   <div className="flex aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 overflow-hidden flex-col">
//                     {/* Gallery */}
//                     <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all group border-b border-dashed border-muted-foreground/20">
//                       <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
//                       <span className="mt-1 text-[10px] text-muted-foreground group-hover:text-primary">
//                         Gallery
//                       </span>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         multiple
//                         className="hidden"
//                         onChange={handleImageChange}
//                       />
//                     </label>

//                     {/* Camera */}
//                     <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-all group">
//                       <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
//                       <span className="mt-1 text-[10px] text-muted-foreground group-hover:text-primary">
//                         Camera
//                       </span>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         capture="environment"
//                         className="hidden"
//                         onChange={handleImageChange}
//                       />
//                     </label>
//                   </div>
//                 ))}
//             </div>
//             <p className="text-xs text-muted-foreground mt-2">
//               First image will be used as the cover photo
//             </p>
//           </div>

//           {/* Price */}
//           <FormField
//             control={form.control as any}
//             name="price"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Price</FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">
//                       ₦
//                     </span>
//                     <Input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       className="pl-7"
//                       placeholder="0.00"
//                       {...field}
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <Separator />

//         {/* Section 4: Location */}
//         <div>
//           <SectionHeader
//             icon={MapPin}
//             title="Location"
//             description="Where are you selling from?"
//           />
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <FormField
//               control={form.control as any}
//               name="city"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>City</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Lagos" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control as any}
//               name="state"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>
//                     State
//                     <span className="text-xs text-muted-foreground font-normal ml-1">
//                       (Optional)
//                     </span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input placeholder="Lagos State" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control as any}
//               name="country"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Country</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Nigeria" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//         </div>

//         <Button
//           type="submit"
//           size="lg"
//           className="w-full rounded-full text-base shadow-lg shadow-primary/20"
//           disabled={isLoading}
//         >
//           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//           {isLoading
//             ? initialData && initialData.isListed
//               ? "Saving..."
//               : "Posting..."
//             : initialData && initialData.isListed
//               ? "Save Changes"
//               : "Post Listing"}
//         </Button>
//       </form>
//     </Form>
//   );
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////

// "use client";

// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Loader2,
//   Upload,
//   X,
//   ImagePlus,
//   Tag,
//   DollarSign,
//   MapPin,
//   FileText,
//   Info,
//   Camera,
//   ChevronRight,
//   Sparkles,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import imageCompression from "browser-image-compression";
// import Tiptap from "./Tiptap";

// const formSchema = z.object({
//   title: z.string().min(5, "Title must be at least 5 characters"),
//   description: z.string().min(20, "Description must be at least 20 characters"),
//   price: z.coerce.number().min(0, "Price must be a positive number"),
//   category: z.string().min(1, "Please select a category"),
//   condition: z.string().min(1, "Please select item condition"),
//   city: z.string().min(2, "City is required"),
//   state: z.string().optional(),
//   country: z.string().min(2, "Country is required"),
//   uniqueIdentifier: z.string().optional(),
//   brand: z.string().optional(),
//   model: z.string().optional(),
// });

// interface ListingFormProps {
//   initialData?: any;
//   categories: any[];
// }

// const STEP_CONFIG = [
//   {
//     id: 1,
//     icon: Tag,
//     label: "Details",
//     title: "Item Details",
//     subtitle: "Tell buyers what you're selling",
//   },
//   {
//     id: 2,
//     icon: FileText,
//     label: "Description",
//     title: "Description",
//     subtitle: "Describe your item honestly",
//   },
//   {
//     id: 3,
//     icon: ImagePlus,
//     label: "Photos",
//     title: "Photos & Price",
//     subtitle: "Show it off and name your price",
//   },
//   {
//     id: 4,
//     icon: MapPin,
//     label: "Location",
//     title: "Location",
//     subtitle: "Where are you selling from?",
//   },
// ];

// function StepBadge({
//   number,
//   icon: Icon,
//   label,
//   active,
//   done,
// }: {
//   number: number;
//   icon: any;
//   label: string;
//   active?: boolean;
//   done?: boolean;
// }) {
//   return (
//     <div className="flex flex-col items-center gap-1.5">
//       <div
//         className={`
//           w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
//           ${active ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110" : ""}
//           ${done ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" : ""}
//           ${!active && !done ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500" : ""}
//         `}
//       >
//         <Icon className="h-4 w-4" />
//       </div>
//       <span
//         className={`text-[10px] font-semibold tracking-wide uppercase transition-colors
//           ${active ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}
//         `}
//       >
//         {label}
//       </span>
//     </div>
//   );
// }

// function SectionCard({
//   step,
//   title,
//   subtitle,
//   icon: Icon,
//   children,
// }: {
//   step: number;
//   title: string;
//   subtitle: string;
//   icon: any;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="relative rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
//       {/* Left accent bar */}
//       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-l-2xl" />

//       {/* Header */}
//       <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b border-gray-50 dark:border-gray-800/80">
//         <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
//           <Icon className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">
//               Step {step}
//             </span>
//           </div>
//           <p className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-tight">
//             {title}
//           </p>
//           <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="px-6 py-5">{children}</div>
//     </div>
//   );
// }

// export function ListingForm({ initialData, categories }: ListingFormProps) {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageItems, setImageItems] = useState<
//     { url: string; file?: File; isNew: boolean }[]
//   >(initialData?.images?.map((url: string) => ({ url, isNew: false })) || []);
//   const [isCompressing, setIsCompressing] = useState(false);
//   const [compressionProgress, setCompressionProgress] = useState(0);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema) as any,
//     defaultValues: {
//       title: initialData?.listing?.title || initialData?.model || "",
//       description: initialData?.description || "",
//       price: initialData?.listing?.price || 0,
//       category:
//         initialData?.listing?.category?._id ||
//         initialData?.listing?.category ||
//         "",
//       condition: initialData?.listing?.condition || "",
//       city: initialData?.listing?.location?.city || "",
//       state: initialData?.listing?.location?.state || "",
//       country: initialData?.listing?.location?.country || "",
//       uniqueIdentifier: initialData?.uniqueIdentifier || "",
//       brand: initialData?.brand || "",
//       model: initialData?.model || "",
//     },
//   });

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       if (imageItems.length + files.length > 5) {
//         toast.error("Maximum 5 images allowed");
//         return;
//       }

//       setIsCompressing(true);
//       setCompressionProgress(0);
//       const progressMap = new Map<number, number>();

//       const compressedItems = await Promise.all(
//         files.map(async (file, index) => {
//           try {
//             const compressedFile = await imageCompression(file, {
//               maxSizeMB: 1,
//               maxWidthOrHeight: 1920,
//               useWebWorker: true,
//               onProgress: (p) => {
//                 progressMap.set(index, p);
//                 let total = 0;
//                 progressMap.forEach((val) => (total += val));
//                 setCompressionProgress(Math.round(total / files.length));
//               },
//             });
//             return {
//               url: URL.createObjectURL(compressedFile),
//               file: compressedFile,
//               isNew: true,
//             };
//           } catch (error) {
//             console.error("Image compression error:", error);
//             progressMap.set(index, 100);
//             return { url: URL.createObjectURL(file), file, isNew: true };
//           }
//         })
//       );

//       setIsCompressing(false);
//       setCompressionProgress(0);
//       setImageItems((prev) => [...prev, ...compressedItems]);
//     }
//   };

//   const removeImageItem = (index: number) => {
//     setImageItems((prev) => prev.filter((_, i) => i !== index));
//   };

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     if (imageItems.length === 0) {
//       toast.error("Please upload at least one image");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       Object.entries(values).forEach(([key, value]) => {
//         formData.append(key, value.toString());
//       });

//       const existingImages = imageItems
//         .filter((i) => !i.isNew)
//         .map((i) => i.url);
//       existingImages.forEach((url) => formData.append("existingImages", url));
//       imageItems
//         .filter((i) => i.isNew && i.file)
//         .forEach((i) => formData.append("images", i.file!));

//       const isEditingListing = initialData && initialData.isListed;
//       const url = isEditingListing
//         ? `/api/listings/${initialData._id}`
//         : "/api/listings";
//       const method = isEditingListing ? "PUT" : "POST";

//       const res = await fetch(url, { method, body: formData });

//       let data;
//       const text = await res.text();
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         if (res.status === 413)
//           throw new Error("Images are too large. Please upload smaller files.");
//         throw new Error(`Server error (${res.status}). Please try again.`);
//       }

//       if (!res.ok)
//         throw new Error(data.message || data.error || "Failed to save listing");

//       toast.success(
//         isEditingListing ? "Listing updated!" : "Listing created successfully!"
//       );
//       router.push(`/listings/${data._id}`);
//       router.refresh();
//     } catch (error: any) {
//       toast.error(error.message || "Something went wrong.");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   const isEditing = initialData && initialData.isListed;

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit as any)}
//         className="max-w-2xl mx-auto space-y-5 pb-10"
//       >
//         {/* Page Header */}
//         <div className="pt-2 pb-1">
//           <div className="flex items-center gap-2 mb-1">
//             <Sparkles className="h-4 w-4 text-green-500" />
//             <span className="text-xs font-bold uppercase tracking-widest text-green-500">
//               {isEditing ? "Edit Listing" : "New Listing"}
//             </span>
//           </div>
//           <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
//             {isEditing ? "Update your listing" : "What are you selling?"}
//           </h1>
//           <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
//             Fill in the details below to {isEditing ? "update" : "post"} your item on the marketplace.
//           </p>
//         </div>

//         {/* Progress Steps */}
//         <div className="flex items-center justify-between px-2 py-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800">
//           {STEP_CONFIG.map((step, i) => (
//             <div key={step.id} className="flex items-center gap-1 flex-1">
//               <StepBadge
//                 number={step.id}
//                 icon={step.icon}
//                 label={step.label}
//                 active={step.id === 1}
//               />
//               {i < STEP_CONFIG.length - 1 && (
//                 <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-1 mb-4" />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Section 1 — Item Details */}
//         <SectionCard
//           step={1}
//           icon={Tag}
//           title="Item Details"
//           subtitle="Give your listing a clear title and category"
//         >
//           <div className="space-y-4">
//             <FormField
//               control={form.control as any}
//               name="title"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Title
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
//                       className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 focus-visible:border-green-400 text-sm h-11"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control as any}
//                 name="category"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                       Category
//                     </FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 focus:ring-green-500">
//                           <SelectValue placeholder="Select a category" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent className="rounded-xl">
//                         {categories.map((cat) => (
//                           <SelectItem key={cat._id} value={cat._id}>
//                             {cat.icon} {cat.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control as any}
//                 name="condition"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                       Condition
//                     </FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 focus:ring-green-500">
//                           <SelectValue placeholder="Select condition" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent className="rounded-xl">
//                         <SelectItem value="New">🆕 New</SelectItem>
//                         <SelectItem value="Like New">✨ Like New</SelectItem>
//                         <SelectItem value="Used - Good">👍 Used — Good</SelectItem>
//                         <SelectItem value="Used - Fair">👌 Used — Fair</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Unique Identifier */}
//             <FormField
//               control={form.control as any}
//               name="uniqueIdentifier"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
//                     Unique Identifier
//                     <span className="normal-case font-normal text-gray-400">
//                       — Serial No., VIN, IMEI, etc.
//                     </span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="e.g. SN123456789"
//                       className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 h-11 text-sm"
//                       {...field}
//                       disabled={!!initialData?.uniqueIdentifier}
//                     />
//                   </FormControl>
//                   <FormDescription className="flex items-center gap-1.5 text-xs text-gray-400">
//                     <Info className="h-3 w-3 text-green-500" />
//                     Helps buyers verify and track unique items
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control as any}
//                 name="brand"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                       Brand <span className="normal-case font-normal text-gray-400">(Optional)</span>
//                     </FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="e.g. Apple, Toyota"
//                         className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 h-11 text-sm"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control as any}
//                 name="model"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                       Model <span className="normal-case font-normal text-gray-400">(Optional)</span>
//                     </FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="e.g. iPhone 14 Pro"
//                         className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 h-11 text-sm"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>
//         </SectionCard>

//         {/* Section 2 — Description */}
//         <SectionCard
//           step={2}
//           icon={FileText}
//           title="Description"
//           subtitle="Describe your item honestly and in detail"
//         >
//           <FormField
//             control={form.control as any}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormControl>
//                   <Tiptap value={field.value} onChange={field.onChange} />
//                 </FormControl>
//                 <div className="flex items-center justify-between mt-1">
//                   <FormMessage />
//                   <span className="text-[11px] text-gray-400 ml-auto tabular-nums">
//                     {field.value?.length || 0} chars
//                   </span>
//                 </div>
//               </FormItem>
//             )}
//           />
//         </SectionCard>

//         {/* Section 3 — Photos & Price */}
//         <SectionCard
//           step={3}
//           icon={ImagePlus}
//           title="Photos & Price"
//           subtitle="Upload up to 5 photos and set your asking price"
//         >
//           <div className="space-y-5">
//             {/* Image upload */}
//             <div>
//               <div className="flex items-center justify-between mb-3">
//                 <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                   Photos
//                 </FormLabel>
//                 <span
//                   className={`text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums
//                     ${imageItems.length >= 5
//                       ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
//                       : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
//                     }`}
//                 >
//                   {imageItems.length} / 5
//                 </span>
//               </div>

//               <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
//                 {imageItems.map((item, index) => (
//                   <div
//                     key={index}
//                     className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent bg-gray-100 dark:bg-gray-800 group shadow-sm"
//                   >
//                     <img
//                       src={item.url}
//                       alt="Preview"
//                       className="h-full w-full object-cover"
//                     />
//                     {index === 0 && (
//                       <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shadow">
//                         Cover
//                       </span>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => removeImageItem(index)}
//                       className="absolute top-1.5 right-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
//                     >
//                       <X className="h-3 w-3" />
//                     </button>
//                   </div>
//                 ))}

//                 {imageItems.length < 5 &&
//                   (isCompressing ? (
//                     <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 gap-1.5">
//                       <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
//                       <span className="text-xs font-bold text-green-600 tabular-nums">
//                         {compressionProgress}%
//                       </span>
//                       <span className="text-[9px] text-green-500 font-medium">
//                         Optimizing...
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="flex aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden flex-col group hover:border-green-400 transition-colors">
//                       <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-b border-dashed border-gray-200 dark:border-gray-700">
//                         <Upload className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
//                         <span className="mt-1 text-[9px] font-semibold text-gray-400 group-hover:text-green-500 uppercase tracking-wide transition-colors">
//                           Gallery
//                         </span>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           multiple
//                           className="hidden"
//                           onChange={handleImageChange}
//                         />
//                       </label>
//                       <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
//                         <Camera className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
//                         <span className="mt-1 text-[9px] font-semibold text-gray-400 group-hover:text-green-500 uppercase tracking-wide transition-colors">
//                           Camera
//                         </span>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           capture="environment"
//                           className="hidden"
//                           onChange={handleImageChange}
//                         />
//                       </label>
//                     </div>
//                   ))}
//               </div>

//               <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
//                 First image will be used as the cover photo
//               </p>
//             </div>

//             {/* Price */}
//             <FormField
//               control={form.control as any}
//               name="price"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Asking Price
//                   </FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
//                         <span className="text-green-600 dark:text-green-400 font-bold text-base leading-none">
//                           ₦
//                         </span>
//                         <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
//                       </div>
//                       <Input
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         className="pl-10 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 focus-visible:border-green-400 h-12 text-base font-semibold"
//                         placeholder="0.00"
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//         </SectionCard>

//         {/* Section 4 — Location */}
//         <SectionCard
//           step={4}
//           icon={MapPin}
//           title="Location"
//           subtitle="Where are you selling from?"
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <FormField
//               control={form.control as any}
//               name="city"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     City
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Lagos"
//                       className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 h-11 text-sm"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control as any}
//               name="state"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     State{" "}
//                     <span className="normal-case font-normal text-gray-400">(Optional)</span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Lagos State"
//                       className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 h-11 text-sm"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control as any}
//               name="country"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
//                     Country
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Nigeria"
//                       className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 h-11 text-sm"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//         </SectionCard>

//         {/* Submit */}
//         <div className="pt-1">
//           <Button
//             type="submit"
//             size="lg"
//             className="w-full h-13 rounded-2xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 group"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2.5 h-4.5 w-4.5 animate-spin" />
//                 {isEditing ? "Saving changes..." : "Posting your listing..."}
//               </>
//             ) : (
//               <>
//                 <Sparkles className="mr-2.5 h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
//                 {isEditing ? "Save Changes" : "Post Listing"}
//                 <ChevronRight className="ml-auto h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
//               </>
//             )}
//           </Button>
//           <p className="text-center text-xs text-gray-400 mt-3">
//             By posting, you agree to our{" "}
//             <span className="text-green-500 underline underline-offset-2 cursor-pointer hover:text-green-600">
//               Marketplace Guidelines
//             </span>
//           </p>
//         </div>
//       </form>
//     </Form>
//   );
// }


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
  MapPin,
  FileText,
  Info,
  Camera,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Eye,
  Package,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import imageCompression from "browser-image-compression";
import Tiptap from "./Tiptap";

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

type FormValues = z.infer<typeof formSchema>;

interface ListingFormProps {
  initialData?: any;
  categories: any[];
}

const STEP_CONFIG = [
  { id: 1, icon: Tag, label: "Details", title: "Item Details", subtitle: "Tell buyers what you're selling" },
  { id: 2, icon: FileText, label: "Description", title: "Description", subtitle: "Describe your item honestly" },
  { id: 3, icon: ImagePlus, label: "Photos", title: "Photos & Price", subtitle: "Show it off and name your price" },
  { id: 4, icon: MapPin, label: "Location", title: "Location", subtitle: "Where are you selling from?" },
];

function SectionCard({ step, title, subtitle, icon: Icon, children }: {
  step: number; title: string; subtitle: string; icon: any; children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-l-2xl" />
      <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b border-gray-50 dark:border-gray-800/80">
        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Step {step}</span>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-tight">{title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function ListingPreview({ values, imageItems, categories }: {
  values: Partial<FormValues>;
  imageItems: { url: string }[];
  categories: any[];
}) {
  const categoryName = categories.find((c) => c._id === values.category)?.name ?? null;

  const completionItems = [
    { label: "Title", done: (values.title?.length ?? 0) >= 5 },
    { label: "Category", done: !!values.category },
    { label: "Condition", done: !!values.condition },
    { label: "Description", done: (values.description?.length ?? 0) >= 20 },
    { label: "Photo", done: imageItems.length > 0 },
    { label: "Price", done: (values.price ?? 0) > 0 },
    { label: "City", done: (values.city?.length ?? 0) >= 2 },
    { label: "Country", done: (values.country?.length ?? 0) >= 2 },
  ];

  const doneCount = completionItems.filter((i) => i.done).length;
  const pct = Math.round((doneCount / completionItems.length) * 100);

  return (
    <div className="space-y-4">
      {/* Preview card */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
          {imageItems[0] ? (
            <img src={imageItems[0].url} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-gray-600">
              <Package className="h-10 w-10" />
              <span className="text-xs font-medium">No photo yet</span>
            </div>
          )}
          {imageItems.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              +{imageItems.length - 1} more
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Eye className="h-2.5 w-2.5" /> Preview
          </div>
        </div>
        <div className="p-4 space-y-2">
          <p className="font-black text-gray-900 dark:text-gray-50 text-sm leading-snug line-clamp-2">
            {values.title || (
              <span className="text-gray-300 dark:text-gray-600 font-normal italic">
                Your title will appear here
              </span>
            )}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-green-600 dark:text-green-400 tabular-nums">
              {values.price && values.price > 0 ? `₦${Number(values.price).toLocaleString()}` : "₦ —"}
            </span>
            {values.condition && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                {values.condition}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categoryName && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {categoryName}
              </span>
            )}
            {values.brand && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {values.brand}
              </span>
            )}
            {(values.city || values.country) && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                📍 {[values.city, values.country].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Completeness */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Completeness
          </p>
          <span className={`text-xs font-black tabular-nums ${pct === 100 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-gray-400"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-gray-300"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {item.done
                ? <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                : <Circle className="h-3 w-3 text-gray-300 dark:text-gray-600 shrink-0" />
              }
              <span className={`text-[11px] font-medium truncate ${item.done ? "text-gray-600 dark:text-gray-300" : "text-gray-300 dark:text-gray-600"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-green-100 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-2.5">
          Tips for faster sales
        </p>
        <div className="space-y-2">
          {["Use clear, well-lit photos", "Set a competitive price", "Add brand & model details", "Write an honest description"].map((tip) => (
            <p key={tip} className="text-[11px] text-green-700 dark:text-green-400 flex items-start gap-1.5">
              <span className="mt-1 w-1 h-1 rounded-full bg-green-400 shrink-0 inline-block" />
              {tip}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListingForm({ initialData, categories }: ListingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [imageItems, setImageItems] = useState<{ url: string; file?: File; isNew: boolean }[]>(
    initialData?.images?.map((url: string) => ({ url, isNew: false })) || []
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const form = useForm<FormValues>({
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

  const watchedValues = form.watch();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (imageItems.length + files.length > 5) { toast.error("Maximum 5 images allowed"); return; }
    setIsCompressing(true);
    setCompressionProgress(0);
    const progressMap = new Map<number, number>();
    const compressedItems = await Promise.all(
      files.map(async (file, index) => {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true,
            onProgress: (p) => {
              progressMap.set(index, p);
              let total = 0;
              progressMap.forEach((val) => (total += val));
              setCompressionProgress(Math.round(total / files.length));
            },
          });
          return { url: URL.createObjectURL(compressedFile), file: compressedFile, isNew: true };
        } catch {
          progressMap.set(index, 100);
          return { url: URL.createObjectURL(file), file, isNew: true };
        }
      })
    );
    setIsCompressing(false);
    setCompressionProgress(0);
    setImageItems((prev) => [...prev, ...compressedItems]);
  };

  const removeImageItem = (index: number) =>
    setImageItems((prev) => prev.filter((_, i) => i !== index));

  async function onSubmit(values: FormValues) {
    if (imageItems.length === 0) { toast.error("Please upload at least one image"); return; }
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.append(k, v?.toString() ?? ""));
      imageItems.filter((i) => !i.isNew).forEach((i) => formData.append("existingImages", i.url));
      imageItems.filter((i) => i.isNew && i.file).forEach((i) => formData.append("images", i.file!));

      const isEditingListing = initialData && initialData.isListed;
      const url = isEditingListing ? `/api/listings/${initialData._id}` : "/api/listings";
      const method = isEditingListing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {
        if (res.status === 413) throw new Error("Images too large.");
        throw new Error(`Server error (${res.status}).`);
      }
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save");

      toast.success(isEditingListing ? "Listing updated!" : "Listing created!");
      router.push(`/listings/${data._id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  const isEditing = initialData && initialData.isListed;
  const inputCls = "rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 focus-visible:border-green-400 text-sm h-11";
  const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <div className="flex flex-col xl:flex-row xl:items-start gap-6">

          {/* ── Left: form ── */}
          <div className="flex-1 min-w-0 space-y-5 pb-10">

            {/* Header */}
            <div className="pt-2 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-500">
                  {isEditing ? "Edit Listing" : "New Listing"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">
                {isEditing ? "Update your listing" : "What are you selling?"}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Fill in the details below to {isEditing ? "update" : "post"} your item on the marketplace.
              </p>
            </div>

            {/* Step strip */}
            <div className="flex items-center justify-between px-2 py-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800">
              {STEP_CONFIG.map((step, i) => (
                <div key={step.id} className="flex items-center gap-1 flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-gray-500">
                      {step.label}
                    </span>
                  </div>
                  {i < STEP_CONFIG.length - 1 && (
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-1 mb-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Section 1 */}
            <SectionCard step={1} icon={Tag} title="Item Details" subtitle="Give your listing a clear title and category">
              <div className="space-y-4">
                <FormField control={form.control as any} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPhone 14 Pro Max 256GB Space Black" className={inputCls} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control as any} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelCls}>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 focus:ring-green-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>{cat.icon} {cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="condition" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelCls}>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-11 focus:ring-green-500">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="New">🆕 New</SelectItem>
                          <SelectItem value="Like New">✨ Like New</SelectItem>
                          <SelectItem value="Used - Good">👍 Used — Good</SelectItem>
                          <SelectItem value="Used - Fair">👌 Used — Fair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control as any} name="uniqueIdentifier" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`${labelCls} flex items-center gap-1.5`}>
                      Unique Identifier
                      <span className="normal-case font-normal text-gray-400">— Serial No., VIN, IMEI, etc.</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SN123456789" className={inputCls} {...field} disabled={!!initialData?.uniqueIdentifier} />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Info className="h-3 w-3 text-green-500" />
                      Helps buyers verify and track unique items
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control as any} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelCls}>Brand <span className="normal-case font-normal text-gray-400">(Optional)</span></FormLabel>
                      <FormControl><Input placeholder="e.g. Apple, Toyota" className={inputCls} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control as any} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelCls}>Model <span className="normal-case font-normal text-gray-400">(Optional)</span></FormLabel>
                      <FormControl><Input placeholder="e.g. iPhone 14 Pro" className={inputCls} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </SectionCard>

            {/* Section 2 */}
            <SectionCard step={2} icon={FileText} title="Description" subtitle="Describe your item honestly and in detail">
              <FormField control={form.control as any} name="description" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tiptap value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <div className="flex items-center justify-between mt-1">
                    <FormMessage />
                    <span className="text-[11px] text-gray-400 ml-auto tabular-nums">
                      {field.value?.length || 0} chars
                    </span>
                  </div>
                </FormItem>
              )} />
            </SectionCard>

            {/* Section 3 */}
            <SectionCard step={3} icon={ImagePlus} title="Photos & Price" subtitle="Upload up to 5 photos and set your asking price">
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <FormLabel className={labelCls}>Photos</FormLabel>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums ${imageItems.length >= 5 ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"}`}>
                      {imageItems.length} / 5
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {imageItems.map((item, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent bg-gray-100 dark:bg-gray-800 group shadow-sm">
                        <img src={item.url} alt="Preview" className="h-full w-full object-cover" />
                        {index === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shadow">
                            Cover
                          </span>
                        )}
                        <button type="button" onClick={() => removeImageItem(index)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imageItems.length < 5 && (isCompressing ? (
                      <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 gap-1.5">
                        <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
                        <span className="text-xs font-bold text-green-600 tabular-nums">{compressionProgress}%</span>
                        <span className="text-[9px] text-green-500 font-medium">Optimizing...</span>
                      </div>
                    ) : (
                      <div className="flex aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden flex-col group hover:border-green-400 transition-colors">
                        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-b border-dashed border-gray-200 dark:border-gray-700">
                          <Upload className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                          <span className="mt-1 text-[9px] font-semibold text-gray-400 group-hover:text-green-500 uppercase tracking-wide transition-colors">Gallery</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        </label>
                        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                          <Camera className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                          <span className="mt-1 text-[9px] font-semibold text-gray-400 group-hover:text-green-500 uppercase tracking-wide transition-colors">Camera</span>
                          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    First image will be used as the cover photo
                  </p>
                </div>

                <FormField control={form.control as any} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>Asking Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <span className="text-green-600 dark:text-green-400 font-bold text-base leading-none">₦</span>
                          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
                        </div>
                        <Input type="number" min="0" step="0.01"
                          className="pl-10 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-green-500 focus-visible:border-green-400 h-12 text-base font-semibold"
                          placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>

            {/* Section 4 */}
            <SectionCard step={4} icon={MapPin} title="Location" subtitle="Where are you selling from?">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form.control as any} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>City</FormLabel>
                    <FormControl><Input placeholder="Lagos" className={inputCls} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control as any} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>State <span className="normal-case font-normal text-gray-400">(Optional)</span></FormLabel>
                    <FormControl><Input placeholder="Lagos State" className={inputCls} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control as any} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>Country</FormLabel>
                    <FormControl><Input placeholder="Nigeria" className={inputCls} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>

            {/* Submit */}
            <div className="pt-1">
              <Button type="submit" size="lg"
                className="w-full h-13 rounded-2xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 group"
                disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2.5 h-4 w-4 animate-spin" />
                    {isEditing ? "Saving changes..." : "Posting your listing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2.5 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    {isEditing ? "Save Changes" : "Post Listing"}
                    <ChevronRight className="ml-auto h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
              {/* <p className="text-center text-xs text-gray-400 mt-3">
                By posting, you agree to our{" "}
                <span className="text-green-500 underline underline-offset-2 cursor-pointer hover:text-green-600">
                  Marketplace Guidelines
                </span>
              </p> */}
            </div>
          </div>

          {/* ── Right: sticky preview (xl+ only) ── */}
          <div className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">
                Live Preview
              </p>
              <ListingPreview
                values={watchedValues}
                imageItems={imageItems}
                categories={categories}
              />
            </div>
          </div>

        </div>
      </form>
    </Form>
  );
}