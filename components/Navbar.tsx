"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, PlusCircle, User, LogOut, LayoutDashboard, ShoppingBag, Menu } from "lucide-react";
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
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
           <ShoppingBag className="h-6 w-6 text-primary" />
           <span className="text-xl font-bold tracking-tight">Trade Zone</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/browse" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Browse
          </Link>
          <Link href="/categories" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Categories
          </Link>
        </nav>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-md px-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for anything..."
              className="w-full pl-8 bg-background"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="default" size="sm" className="hidden md:flex">
             <Link href="/listings/create">
               <PlusCircle className="mr-2 h-4 w-4" />
               Post Ad
             </Link>
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:flex">
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
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                <Input type="search" placeholder="Search..." />
                <nav className="flex flex-col space-y-4">
                  <Link href="/browse" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    Browse
                  </Link>
                  <Link href="/categories" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                    Categories
                  </Link>
                  <Link href="/listings/create" className="text-sm font-medium text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                    Post an Ad
                  </Link>
                </nav>
                 <div className="border-t pt-4">
                  {session ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Signed in as {session.user?.name}</p>
                       <Link href="/dashboard" className="text-sm" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                       <Button variant="outline" size="sm" onClick={() => signOut()}>Log out</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button asChild variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/auth/signin">Sign In</Link>
                      </Button>
                      <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href="/auth/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
