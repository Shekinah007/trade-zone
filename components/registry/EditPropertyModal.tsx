"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const ITEM_TYPES = [
  { value: "phone", label: "Phone / Smartphone" },
  { value: "tablet", label: "Tablet" },
  { value: "laptop", label: "Laptop / PC" },
  { value: "vehicle", label: "Car / Vehicle" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "generator", label: "Generator" },
  { value: "electronics", label: "Electronics" },
  { value: "other", label: "Other" },
];

export function EditPropertyModal({
  isOpen,
  onClose,
  property,
}: {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    itemType: property.itemType || "",
    brand: property.brand || "",
    model: property.model || "",
    description: property.description || "",
    serialNumber: property.serialNumber || "",
    imei: property.imei || "",
    chassisNumber: property.chassisNumber || "",
    color: property.color || "",
    yearOfPurchase: property.yearOfPurchase || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemType || !form.brand || !form.model) {
      toast.error("Please fill in the required fields (Type, Brand, Model).");
      return;
    }
    if (!form.serialNumber && !form.imei && !form.chassisNumber) {
      toast.error(
        "Please provide at least one identifier (Serial, IMEI, Chassis).",
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString());
      });

      const res = await fetch(`/api/registry/${property._id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Property updated successfully!");
        onClose();
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to update property");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Registered Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Type *</Label>
              <Select
                value={form.itemType}
                onValueChange={(val) => handleSelectChange("itemType", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand / Make *</Label>
                <Input
                  name="brand"
                  placeholder="e.g. Apple, Toyota"
                  value={form.brand}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Input
                  name="model"
                  placeholder="e.g. iPhone 13 Pro"
                  value={form.model}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Distinctive Features</Label>
              <Textarea
                name="description"
                placeholder="Any scratches, dents, or modifications?"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  name="color"
                  placeholder="e.g. Space Gray"
                  value={form.color}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Year of Purchase</Label>
                <Input
                  name="yearOfPurchase"
                  type="number"
                  placeholder="e.g. 2023"
                  value={form.yearOfPurchase}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl space-y-4 border border-amber-100 dark:border-amber-900">
              <h3 className="font-semibold text-sm text-amber-800 dark:text-amber-500">
                Identifiers (Provide at least one)
              </h3>

              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  name="serialNumber"
                  placeholder="SN..."
                  value={form.serialNumber}
                  onChange={handleChange}
                />
              </div>

              {["phone", "tablet"].includes(form.itemType) && (
                <div className="space-y-2">
                  <Label>IMEI Number</Label>
                  <Input
                    name="imei"
                    placeholder="15-digit IMEI..."
                    value={form.imei}
                    onChange={handleChange}
                  />
                </div>
              )}

              {["vehicle", "motorcycle"].includes(form.itemType) && (
                <div className="space-y-2">
                  <Label>VIN / Chassis Number</Label>
                  <Input
                    name="chassisNumber"
                    placeholder="17-character VIN..."
                    value={form.chassisNumber}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
