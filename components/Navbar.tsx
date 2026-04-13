"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  PlusCircle,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  Heart,
  ShoppingBag,
} from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppMode } from "@/components/AppModeContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { mode, setMode } = useAppMode();
  const isMarketplace = mode === "marketplace";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (isMarketplace) {
      router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
    } else {
      router.push(q ? `/registry/search?q=${encodeURIComponent(q)}` : "/registry/search");
    }
  };

  const openMobileMenu = (open: boolean) => {
    if (open) {
      setIsMobileMenuOpen(true);
      setTimeout(() => setMenuVisible(true), 50);
    } else {
      setMenuVisible(false);
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setMenuVisible(false);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-background border-b",
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        <div className="flex items-center lg:space-x-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <div className={cn("p-2 rounded-xl transition-colors", isMarketplace ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-blue-500/10 group-hover:bg-blue-500/20")}>
              {isMarketplace ? <ShoppingBag className={cn("h-6 w-6 text-emerald-600")} /> : <Shield className={cn("h-6 w-6 text-blue-600")} />}
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
              FindMaster
            </span>
          </Link>

          {/* Context Switcher Pill */}
          <div className="hidden md:flex items-center p-1 bg-muted rounded-full border border-border/50">
            <button
              onClick={() => { setMode("marketplace"); router.push("/browse"); }}
              className={cn("flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all", isMarketplace ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Marketplace
            </button>
            <button
              onClick={() => { setMode("registry"); router.push("/registry"); }}
              className={cn("flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all", !isMarketplace ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Registry
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
          {isMarketplace ? (
            <>
              <Link href="/browse" className="transition-colors hover:text-emerald-600 text-foreground/80">Browse</Link>
              <Link href="/categories" className="transition-colors hover:text-emerald-600 text-foreground/80">Categories</Link>
            </>
          ) : (
            <>
              <Link href="/registry" className="transition-colors hover:text-blue-600 text-foreground/80">My Registry</Link>
            </>
          )}
        </nav>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 items-center justify-center max-w-sm"
        >
          <div className="relative w-full group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors" />
            <Input
              type="search"
              placeholder={isMarketplace ? "Search marketplace..." : "Search IMEI/Serial..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-full pl-10 bg-muted/50 transition-all rounded-full focus-visible:ring-1", isMarketplace ? "focus-visible:ring-emerald-500" : "focus-visible:ring-blue-500")}
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {isMarketplace ? (
             <Button
             asChild
             variant="default"
             size="sm"
             className="hidden md:flex rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-emerald-600 hover:bg-emerald-700 text-white border-0"
           >
             <Link href="/listings/create">
               <PlusCircle className="h-4 w-4 mr-2" />
               Post Ad
             </Link>
           </Button>
          ) : (
            <Button
              asChild
              variant="default"
              size="sm"
              className="hidden md:flex rounded-full px-5 shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-all border-0"
            >
              <Link href="/registry/register">
                <Shield className="h-4 w-4 mr-2" />
                Register Item
              </Link>
            </Button>
          )}

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn("relative h-9 w-9 rounded-full ring-2 ring-transparent transition-all", isMarketplace ? "hover:ring-emerald-500/30" : "hover:ring-blue-500/30")}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className={cn("text-white", isMarketplace ? "bg-emerald-600" : "bg-blue-600")}>
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" /> Saved Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                
                {session?.user?.role === "admin" && (
                    <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer text-purple-600">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                    </Link>
                    </DropdownMenuItem>
                    </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm" className={cn("rounded-full", isMarketplace ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700")}>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={openMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              
              <div className="flex flex-col flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Mobile Mode Switcher */}
                <div className="flex rounded-lg bg-muted p-1 border">
                    <button
                        onClick={() => { setMode("marketplace"); router.push("/browse"); closeMobileMenu(); }}
                        className={cn("flex-1 text-sm py-2 rounded-md font-semibold transition-all", isMarketplace ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground")}
                    >
                        Marketplace
                    </button>
                    <button
                         onClick={() => { setMode("registry"); router.push("/registry"); closeMobileMenu(); }}
                        className={cn("flex-1 text-sm py-2 rounded-md font-semibold transition-all", !isMarketplace ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground")}
                    >
                        Registry
                    </button>
                </div>

                {menuVisible && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      closeMobileMenu();
                      handleSearch(e);
                    }}
                  >
                    <div className="relative group">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors" />
                      <Input
                        type="search"
                        placeholder={isMarketplace ? "Search marketplace..." : "Search registry..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn("pl-10 bg-muted/50 rounded-full transition-all text-sm", isMarketplace ? "focus-visible:ring-emerald-500" : "focus-visible:ring-blue-500")}
                      />
                    </div>
                  </form>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    {isMarketplace ? "Marketplace Menu" : "Registry Menu"}
                  </p>
                  <nav className="flex flex-col space-y-1">
                    {isMarketplace ? (
                        <>
                            <Link onClick={closeMobileMenu} href="/browse" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium hover:text-emerald-700 hover:bg-emerald-50">Browse Listings</Link>
                            <Link onClick={closeMobileMenu} href="/categories" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium hover:text-emerald-700 hover:bg-emerald-50">Categories</Link>
                        </>
                    ) : (
                        <>
                           <Link onClick={closeMobileMenu} href="/registry" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium hover:text-blue-700 hover:bg-blue-50">My Registry</Link>
                           <Link onClick={closeMobileMenu} href="/registry/search" className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium hover:text-blue-700 hover:bg-blue-50">Search Registry</Link>
                        </>
                    )}
                  </nav>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t bg-muted/20">
                {session ? (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback className={cn("text-white font-bold", isMarketplace ? "bg-emerald-600" : "bg-blue-600")}>
                          {session.user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                      </div>
                    </div>

                    <Button asChild variant="outline" className="w-full justify-start rounded-xl" onClick={closeMobileMenu}>
                      <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                    </Button>

                    <Button asChild className={cn("w-full justify-start rounded-full shadow-md", isMarketplace ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white")} onClick={closeMobileMenu}>
                      {isMarketplace ? (
                         <Link href="/listings/create"><PlusCircle className="mr-2 h-4 w-4" /> Post an Ad</Link>
                      ) : (
                         <Link href="/registry/register"><Shield className="mr-2 h-4 w-4" /> Register Item</Link>
                      )}
                    </Button>
                    <Button variant="ghost" className="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10" onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Button asChild variant="outline" className="w-full rounded-full" onClick={closeMobileMenu}>
                      <Link href="/auth/signin">Sign In</Link>
                    </Button>
                    <Button asChild className={cn("w-full rounded-full", isMarketplace ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700")} onClick={closeMobileMenu}>
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
