import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 mx-auto md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">
                Trade Zone
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted marketplace for buying and selling locally and
              globally.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/browse" className="hover:text-foreground">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/listings/create" className="hover:text-foreground">
                  Sell Item
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  Help Center/FAQ
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-foreground">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Trade Zone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
