"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Plus,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Tag,
  Globe,
  CreditCard,
  Award,
  ImagePlus,
  QrCode,
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
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  type: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  businessHours: z.string().optional(),
  image: z.string().optional(),
  qrCode: z.string().optional(),
  categories: z.array(z.object({ value: z.string() })).optional(),
  certifications: z.array(z.object({ value: z.string() })).optional(),
  socials: z
    .array(
      z.object({
        name: z.string().min(1, "Platform name required"),
        link: z.string().url("Must be a valid URL"),
      }),
    )
    .optional(),
  bankDetails: z
    .array(
      z.object({
        name: z.string().min(1, "Bank name required"),
        account: z.string().min(1, "Account number required"),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BusinessEditFormProps {
  initialData?: any;
  onSuccess?: (updated: any) => void; // ← add this
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

export function BusinessEditForm({
  initialData,
  onSuccess,
}: BusinessEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      description: initialData?.description || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      businessHours: initialData?.businessHours || "",
      image: initialData?.image || "",
      qrCode: initialData?.qrCode || "",
      categories: (initialData?.categories || []).map((v: string) => ({
        value: v,
      })),
      certifications: (initialData?.certifications || []).map((v: string) => ({
        value: v,
      })),
      socials: initialData?.socials || [],
      bankDetails: initialData?.bankDetails || [],
    },
  });

  const categories = useFieldArray({
    control: form.control,
    name: "categories",
  });
  const certifications = useFieldArray({
    control: form.control,
    name: "certifications",
  });
  const socials = useFieldArray({ control: form.control, name: "socials" });
  const bankDetails = useFieldArray({
    control: form.control,
    name: "bankDetails",
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        categories:
          values.categories?.map((c) => c.value).filter(Boolean) || [],
        certifications:
          values.certifications?.map((c) => c.value).filter(Boolean) || [],
        socials: values.socials || [],
        bankDetails: values.bankDetails || [],
      };

      const res = await fetch("/api/business/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      toast.success("Business profile updated!");
      onSuccess?.(updated);
      // router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* Basic Info */}
        <div>
          <SectionHeader
            icon={Building2}
            title="Basic Information"
            description="Your business name, type and description"
          />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Business Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Adaeze Stores" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Retail, Service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mon–Fri 9am–5pm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell buyers about your business..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Contact */}
        <div>
          <SectionHeader
            icon={Phone}
            title="Contact & Location"
            description="How buyers can reach you"
          />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="contact@business.com"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Phone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="+234 800 000 0000"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="123 Business St, Lagos"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Media */}
        <div>
          <SectionHeader
            icon={ImagePlus}
            title="Media"
            description="Logo image URL and QR code"
          />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo / Business Image URL</FormLabel>
                  <FormControl>
                    <div className="flex gap-3 items-center">
                      {field.value && (
                        <img
                          src={field.value}
                          alt="Logo preview"
                          className="h-10 w-10 rounded-lg object-cover border shrink-0"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      )}
                      <Input placeholder="https://..." {...field} />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Direct URL to your business logo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qrCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QR Code URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://..."
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Link to your business QR code image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <SectionHeader
            icon={Tag}
            title="Categories"
            description="What types of products or services do you offer?"
          />
          <div className="space-y-2">
            {categories.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`categories.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="e.g. Electronics, Clothing"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => categories.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => categories.append({ value: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
        </div>

        <Separator />

        {/* Social Links */}
        <div>
          <SectionHeader
            icon={Globe}
            title="Social Links"
            description="Your business social media profiles"
          />
          <div className="space-y-3">
            {socials.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_2fr_auto] gap-2"
              >
                <FormField
                  control={form.control}
                  name={`socials.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Platform" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`socials.${index}.link`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-0.5"
                  onClick={() => socials.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => socials.append({ name: "", link: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Social Link
            </Button>
          </div>
        </div>

        <Separator />

        {/* Bank Details */}
        <div>
          <SectionHeader
            icon={CreditCard}
            title="Bank Details"
            description="Payment information shown to buyers"
          />
          <div className="space-y-3">
            {bankDetails.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_2fr_auto] gap-2"
              >
                <FormField
                  control={form.control}
                  name={`bankDetails.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Bank Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`bankDetails.${index}.account`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Account Number"
                          className="font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-0.5"
                  onClick={() => bankDetails.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => bankDetails.append({ name: "", account: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Bank Account
            </Button>
          </div>
        </div>

        <Separator />

        {/* Certifications */}
        <div>
          <SectionHeader
            icon={Award}
            title="Certifications"
            description="Licenses, awards or accreditations your business holds"
          />
          <div className="space-y-2">
            {certifications.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`certifications.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="e.g. ISO 9001, NAFDAC Certified"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => certifications.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => certifications.append({ value: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Certification
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Saving..." : "Save Business Profile"}
        </Button>
      </form>
    </Form>
  );
}
