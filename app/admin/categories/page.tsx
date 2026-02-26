// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
// import { toast } from "sonner";

// import {
//   useGetCategoriesQuery,
//   useCreateCategoryMutation,
//   useUpdateCategoryMutation,
//   useDeleteCategoryMutation,
//   Category,
// } from "@/redux/features/categories/categoriesApi";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// const categorySchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   icon: z.string().optional(),
// });

// export default function AdminCategoriesPage() {
//   const { data: categories = [], isLoading } = useGetCategoriesQuery();

//   const [createCategory] = useCreateCategoryMutation();
//   const [updateCategory] = useUpdateCategoryMutation();
//   const [deleteCategory] = useDeleteCategoryMutation();

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);

//   const form = useForm<z.infer<typeof categorySchema>>({
//     resolver: zodResolver(categorySchema),
//     defaultValues: { name: "", icon: "" },
//   });

//   const onSubmit = async (values: z.infer<typeof categorySchema>) => {
//     try {
//       if (editingCategory) {
//         await updateCategory({
//           id: editingCategory._id,
//           ...values,
//         }).unwrap();
//         toast.success("Category updated");
//       } else {
//         await createCategory(values).unwrap();
//         toast.success("Category created");
//       }

//       setIsDialogOpen(false);
//       setEditingCategory(null);
//       form.reset();
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Operation failed");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure? This cannot be undone.")) return;
//     try {
//       await deleteCategory(id).unwrap();
//       toast.success("Category deleted");
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Delete failed");
//     }
//   };

//   const openEditDialog = (category: Category) => {
//     setEditingCategory(category);
//     form.reset({
//       name: category.name,
//       icon: category.icon || "",
//     });
//     setIsDialogOpen(true);
//   };

//   if (isLoading)
//     return (
//       <div className="p-8">
//         <Loader2 className="animate-spin" />
//       </div>
//     );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold tracking-tight">Categories</h2>

//         <Dialog
//           open={isDialogOpen}
//           onOpenChange={(open) => {
//             setIsDialogOpen(open);
//             if (!open) {
//               setEditingCategory(null);
//               form.reset({ name: "", icon: "" });
//             }
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" /> Add Category
//             </Button>
//           </DialogTrigger>

//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>
//                 {editingCategory ? "Edit Category" : "Add New Category"}
//               </DialogTitle>
//             </DialogHeader>

//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-4"
//               >
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Electronics" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="icon"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Icon (Emoji)</FormLabel>
//                       <FormControl>
//                         <Input placeholder="💻" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <Button type="submit" className="w-full">
//                   {editingCategory ? "Update" : "Create"}
//                 </Button>
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="rounded-md border bg-card">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Icon</TableHead>
//               <TableHead>Name</TableHead>
//               <TableHead>Slug</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {categories.map((category) => (
//               <TableRow key={category._id}>
//                 <TableCell className="text-xl">
//                   {category.icon}
//                 </TableCell>
//                 <TableCell className="font-medium">
//                   {category.name}
//                 </TableCell>
//                 <TableCell className="text-muted-foreground">
//                   {category.slug}
//                 </TableCell>
//                 <TableCell className="text-right space-x-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => openEditDialog(category)}
//                   >
//                     <Pencil className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="text-destructive"
//                     onClick={() => handleDelete(category._id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}

//             {categories.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={4} className="h-24 text-center">
//                   No categories found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }

"use client";

import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
} from "@/redux/features/categories/categoriesApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  icon: z.string().optional(),
  parent: z.string().optional(),
});

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: "", parent: "" },
  });

  // Separate top-level and subcategories
  const topLevel = categories.filter((c) => !c.parent);
  const subcategories = categories.filter((c) => c.parent);

  const getParentName = (parentId: string) =>
    categories.find((c) => c._id === parentId)?.name || "Unknown";

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    try {
      const payload = {
        name: values.name,
        icon: values.icon,
        parent: values.parent === "none" || !values.parent ? undefined : values.parent,
      };

      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, ...payload }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(payload).unwrap();
        toast.success("Category created");
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const hasChildren = subcategories.some((s) => s.parent === id);
    if (hasChildren) {
      toast.error("Delete subcategories first before deleting this category.");
      return;
    }
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      icon: category.icon || "",
      parent: category.parent || "none",
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = (parentId?: string) => {
    setEditingCategory(null);
    form.reset({ name: "", icon: "", parent: parentId || "none" });
    setIsDialogOpen(true);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground text-xs">
            {topLevel.length} categories · {subcategories.length} subcategories
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              form.reset({ name: "", icon: "", parent: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => openCreateDialog()}>
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Electronics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (Emoji)</FormLabel>
                      <FormControl>
                        <Input placeholder="💻" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None (top-level category)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (top-level)</SelectItem>
                          {topLevel.map((cat) => (
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

                <Button type="submit" className="w-full">
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top-level categories with their subcategories */}
      {/* Mobile: Card layout */}
      <div className="space-y-3 md:hidden">
        {topLevel.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
            No categories found. Add one to get started.
          </div>
        )}
        {topLevel.map((category) => {
          const children = subcategories.filter((s) => s.parent === category._id);
          return (
            <Fragment key={category._id}>
              {/* Parent card */}
              <div className="rounded-xl border bg-muted/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon || "📦"}</span>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2" onClick={() => openCreateDialog(category._id)}>
                      <Plus className="h-3 w-3 mr-1" /> Sub
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(category._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategory chips under parent */}
                {children.length > 0 && (
                  <div className="mt-3 pl-2 border-l-2 border-primary/20 space-y-2">
                    {children.map((sub) => (
                      <div key={sub._id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">↳</span>
                          <span className="text-lg">{sub.icon || "📦"}</span>
                          <div>
                            <p className="text-sm font-medium">{sub.name}</p>
                            <p className="text-xs text-muted-foreground">{sub.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(sub)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(sub._id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topLevel.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
            {topLevel.map((category) => {
              const children = subcategories.filter((s) => s.parent === category._id);
              return (
                <Fragment key={category._id}>
                  <TableRow className="font-medium bg-muted/10">
                    <TableCell className="text-xl">{category.icon}</TableCell>
                    <TableCell className="font-semibold">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{category.slug}</TableCell>
                    <TableCell><Badge variant="secondary">Category</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2" onClick={() => openCreateDialog(category._id)}>
                        <Plus className="h-3 w-3 mr-1" /> Sub
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(category._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {children.map((sub) => (
                    <TableRow key={sub._id} className="bg-background">
                      <TableCell className="text-lg pl-8"><span className="text-muted-foreground mr-1">↳</span>{sub.icon}</TableCell>
                      <TableCell className="pl-8 text-sm text-foreground/80">{sub.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{sub.slug}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">Subcategory</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(sub)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(sub._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
