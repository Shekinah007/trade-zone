// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { Clock, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { ListingForm } from "@/components/ListingForm";

// export default function CreateListingPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [categories, setCategories] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch("/api/categories");
//         const data = await res.json();
//         setCategories(data);
//       } catch (error) {
//         toast.error("Failed to load categories");
//       }
//     };
//     fetchCategories();
//   }, []);

//   console.log(categories);

//   if (status === "loading") {
//     return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
//   }

//   if (status === "unauthenticated") {
//     router.push("/auth/signin?callbackUrl=/listings/create");
//     return null;
//   }


// if (session?.user?.status === 'pending') {
//   return (
//     <div className="container mx-auto px-4 py-20 text-center max-w-md">
//       <div className="p-4 rounded-full bg-yellow-500/10 w-fit mx-auto mb-4">
//         <Clock className="h-10 w-10 text-yellow-500" />
//       </div>
//       <h1 className="text-2xl font-bold mb-2">Approval Pending</h1>
//       <p className="text-muted-foreground">
//         Your account is currently under review. You'll be able to post listings once an admin approves your account.
//       </p>
//     </div>
//   );
// }

//   return (
//     <div className="container mx-auto py-10 px-4 max-w-3xl">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Post a New Ad</CardTitle>
//           <CardDescription>
//             Fill in the details below to list your item for sale.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ListingForm categories={categories} />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock, Loader2, PlusCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ListingForm } from "@/components/ListingForm";

export default function CreateListingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/listings/create");
    return null;
  }

  if (session?.user?.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mx-auto w-fit mb-6">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl" />
            <div className="relative p-5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-3">Account Pending Approval</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Your account is currently under review by our team. You'll be notified once approved and can start posting listings.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border hover:bg-muted transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Link
            href="/browse"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Browse
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <PlusCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Post a New Ad</h1>
              <p className="text-muted-foreground text-sm">
                Fill in the details below to list your item for sale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-1 md:px-4 py-4 max-w-3xl">
        {/* Progress hint */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Item Details", desc: "Title, category, condition" },
            { label: "Photos & Price", desc: "Images and pricing" },
            { label: "Location", desc: "Where you're selling from" },
          ].map((step, i) => (
            <div key={i} className="rounded-xl border bg-background p-3 text-center">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mx-auto mb-1">
                {i + 1}
              </div>
              <p className="text-xs font-semibold">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-background shadow-sm p-6 md:p-8">
          <ListingForm categories={categories} />
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-muted-foreground mt-6">
          By posting, you agree to our{" "}
          <Link href="/terms" className="hover:text-primary underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-primary underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
