import Link from "next/link";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const offices = [
  {
    name: "Head Office",
    address: "FindMasters House, Lekki, Lagos State, Nigeria",
    phone: "+234 902 491 3958",
  },
  {
    name: "Partner Branch",
    address: "214, Kirikiri Road, Olodi Apapa, Lagos State, Nigeria",
    phone: "+234 803 719 7609",
  },
  {
    name: "South-South Office",
    address: "13, Ugbague Street, Off Forestry Road, Benin City, Edo State",
    phone: "+234 803 585 6196",
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-10 mx-auto md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                FindMasters
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Africa&apos;s #1 property security registry and trusted marketplace.
              Register, verify, and trade with confidence.
            </p>

            {/* Emails */}
            <div className="space-y-1 text-xs text-muted-foreground">
              {[
                "findmaster.org@gmail.com",
                "info@findmaster.org",
                "support@findmaster.org",
                "technical@findmaster.org",
              ].map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Mail className="h-3 w-3" />
                  {email}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
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

          {/* Registry */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Property Registry</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/registry" className="hover:text-foreground">
                  Registry Home
                </Link>
              </li>
              <li>
                <Link href="/registry/search" className="hover:text-foreground">
                  Search Registry
                </Link>
              </li>
              <li>
                <Link
                  href="/registry/register"
                  className="hover:text-foreground"
                >
                  Register Property
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  Help Center / FAQ
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

          {/* Legal */}
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

        {/* Offices */}
        <div className="mt-10 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-5">
          {offices.map((office) => (
            <div key={office.name} className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                {office.name}
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                {office.address}
              </p>
              <a
                href={`tel:${office.phone.replace(/\s/g, "")}`}
                className="text-xs text-muted-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Phone className="h-3 w-3" />
                {office.phone}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} FindMasters. All rights reserved.
          </p>
          <p className="text-xs">
            Securing property. Empowering trust.{" "}
            <a
              href="http://www.findmaster.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              www.findmaster.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
