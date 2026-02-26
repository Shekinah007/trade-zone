"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  price?: string;
}

export function ShareButton({ title, price }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Check out this listing: ${title}${price ? ` - ${price}` : ""}\n${getUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Check out this listing: ${title}${price ? ` - ${price}` : ""}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(getUrl())}`, "_blank");
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title,
        text: `Check out this listing: ${title}${price ? ` - ${price}` : ""}`,
        url: getUrl(),
      });
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Share this listing
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Copy link */}
        <DropdownMenuItem onClick={copyLink} className="flex items-center gap-3 p-3 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            {copied
              ? <Check className="h-4 w-4 text-green-500" />
              : <Copy className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div>
            <p className="font-medium text-sm">{copied ? "Copied!" : "Copy Link"}</p>
            <p className="text-xs text-muted-foreground">Copy to clipboard</p>
          </div>
        </DropdownMenuItem>

        {/* WhatsApp */}
        <DropdownMenuItem onClick={shareWhatsApp} className="flex items-center gap-3 p-3 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.847L0 24l6.335-1.502A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.031-1.388l-.361-.214-3.762.892.952-3.67-.235-.376A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">WhatsApp</p>
            <p className="text-xs text-muted-foreground">Share via WhatsApp</p>
          </div>
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem onClick={shareFacebook} className="flex items-center gap-3 p-3 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">Facebook</p>
            <p className="text-xs text-muted-foreground">Share to Facebook</p>
          </div>
        </DropdownMenuItem>

        {/* Twitter/X */}
        <DropdownMenuItem onClick={shareTwitter} className="flex items-center gap-3 p-3 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">Twitter / X</p>
            <p className="text-xs text-muted-foreground">Share to X</p>
          </div>
        </DropdownMenuItem>

        {/* Native share — only shown on mobile */}
        {hasNativeShare && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={nativeShare} className="flex items-center gap-3 p-3 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">More options</p>
                <p className="text-xs text-muted-foreground">Use device share sheet</p>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}