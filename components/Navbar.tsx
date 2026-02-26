"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, PlusCircle, User, LogOut, LayoutDashboard, ShoppingBag, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  console.log("Session: ", session)

  const [searchQuery, setSearchQuery] = useState("");
const router = useRouter();

const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  const q = searchQuery.trim();
  router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
};

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 shadow",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Trade Zone
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/browse" className="transition-colors hover:text-primary text-foreground/80">
            Browse
          </Link>
          <Link href="/categories" className="transition-colors hover:text-primary text-foreground/80">
            Categories
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        {/* <div className="hidden md:flex flex-1 items-center justify-center max-w-md px-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search for anything..."
              className="w-full pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-full"
            />
          </div>
        </div> */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center justify-center max-w-md px-8">
  <div className="relative w-full group">
    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
    <Input
      type="search"
      placeholder="Search for anything..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-full"
    />
  </div>
</form>


          

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="default" size="sm" className="hidden md:flex rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0">
            <Link href="/listings/create">
              <PlusCircle className="h-4 w-4" />
              Post Ad
            </Link>
          </Button>

          {
            session ? session.user.role === "admin" ? (
              <Button asChild variant="default" size="sm" className="hidden md:flex rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-0">
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            ) : null : null
          }

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm" className="hidden md:flex hover:bg-primary/5 hover:text-primary">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="hidden md:flex rounded-full">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
         <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
    
    {/* Header */}
    <div className="flex items-center space-x-2 p-5 border-b">
      <div className="bg-primary/10 p-2 rounded-xl">
        <ShoppingBag className="h-5 w-5 text-primary" />
      </div>
      <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
        Trade Zone
      </span>
    </div>

    {/* Scrollable Body */}
    <div className="flex flex-col flex-1 overflow-y-auto p-5 space-y-6">

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleSearch(e); }}>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search for anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 rounded-full transition-all"
          />
        </div>
      </form>

      {/* Navigation */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Menu</p>
        <nav className="flex flex-col space-y-1">
          {[
            { href: "/browse", label: "Browse Listings" },
            { href: "/categories", label: "Categories" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
   

      {/* Post Ad CTA */}
      <Button
        asChild
        className="w-full rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-md"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Link href="/listings/create">
          <PlusCircle className="mr-2 h-4 w-4" />
          Post an Ad
        </Link>
      </Button>
    </div>

    {/* Footer / User Section */}
    <div className="p-5 border-t bg-muted/20">
      {session ? (
        <div className="flex flex-col space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background border">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {session.user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full justify-start rounded-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>

             {
            session ? session.user.role === "admin" ? (
              <Button asChild variant="default" size="sm" className="rounded-full px-6 justify-start shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-purple-600 to-primary hover:from-primary/90 hover:to-purple-600/90 border-0">
                <Link href="/admin">
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            ) : null : null
          }

          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <p className="text-xs text-center text-muted-foreground mb-1">Join thousands of traders today</p>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-full"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button
            asChild
            className="w-full rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
        </div>
      )}
    </div>

  </SheetContent>
</Sheet>
        </div>
      </div>
    </header>
  );
}
