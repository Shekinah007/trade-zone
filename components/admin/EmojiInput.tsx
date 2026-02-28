"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface EmojiInputProps {
  value: string;
  onChange: (val: string) => void;
}

export function EmojiInput({ value, onChange }: EmojiInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-10 w-10 rounded-lg border bg-muted hover:bg-muted/80 flex items-center justify-center text-xl transition-colors shrink-0"
        >
          {value || "＋"}
        </button>
        <Input
          placeholder="Or type an emoji..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>

      {open && (
        <div className="absolute top-12 left-0 z-50 shadow-xl rounded-xl overflow-hidden border">
          <EmojiPicker
            onEmojiClick={(data) => {
              onChange(data.emoji);
              setOpen(false);
            }}
            width={300}
            height={350}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}