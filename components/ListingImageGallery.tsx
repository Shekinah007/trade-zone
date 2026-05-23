"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from "lucide-react";

interface ListingImageGalleryProps {
  images: string[];
  altText: string;
}

export function ListingImageGallery({ images, altText }: ListingImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const safeImages = images?.length > 0 ? images : ["/placeholder.jpg"];

  // ── Open / close lightbox ──────────────────────────────────────────────
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    setIsZoomed(false);
    setTranslate({ x: 0, y: 0 });
    // Prevent body scroll
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setIsZoomed(false);
    setTranslate({ x: 0, y: 0 });
    document.body.style.overflow = "";
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % safeImages.length);
    setIsZoomed(false);
    setTranslate({ x: 0, y: 0 });
  }, [safeImages.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    setIsZoomed(false);
    setTranslate({ x: 0, y: 0 });
  }, [safeImages.length]);

  // ── Keyboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  // ── Zoom on click ──────────────────────────────────────────────────────
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin({ x, y });
      setIsZoomed(true);
      setTranslate({ x: 0, y: 0 });
    } else {
      setIsZoomed(false);
      setTranslate({ x: 0, y: 0 });
    }
  };

  // ── Drag to pan when zoomed ────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    setIsDragging(false);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    if (e.buttons !== 1) return;
    setIsDragging(true);
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = Math.abs(t.clientY - touchStartRef.current.y);
    if (Math.abs(dx) > 50 && dy < 60) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartRef.current = null;
  };

  // ── Thumbnail scroll in main gallery ─────────────────────────────────
  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(safeImages.length - 1, i + 1));

  return (
    <>
      {/* ── Main Gallery ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Primary image */}
        <div
          className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-muted cursor-zoom-in group"
          onClick={() => openLightbox(activeIndex)}
        >
          <Image
            src={safeImages[activeIndex]}
            alt={altText}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
          {/* Expand hint */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="h-3.5 w-3.5" />
            View fullscreen
          </div>
          {safeImages.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white rounded-full px-2.5 py-1 text-xs font-medium">
              {activeIndex + 1} / {safeImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {safeImages.length > 1 && (
          <div className="relative flex items-center gap-2">
            {activeIndex > 0 && (
              <button
                onClick={prev}
                className="absolute left-0 z-10 bg-white/90 shadow rounded-full p-1 hover:bg-white transition"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth w-full px-6">
              {safeImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeIndex
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  aria-label={`Image ${i + 1}`}
                >
                  <Image src={src} alt={`${altText} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
            {activeIndex < safeImages.length - 1 && (
              <button
                onClick={next}
                className="absolute right-0 z-10 bg-white/90 shadow rounded-full p-1 hover:bg-white transition"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Fullscreen Lightbox ───────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          // Use fixed positioning + inset-0 for cross-browser fullscreen coverage
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          // Close on backdrop click (not on image)
          onClick={(e) => {
            if (e.target === lightboxRef.current) closeLightbox();
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              padding: "8px",
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          {safeImages.length > 1 && (
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                letterSpacing: "0.05em",
                zIndex: 10,
              }}
            >
              {lightboxIndex + 1} / {safeImages.length}
            </div>
          )}

          {/* Zoom hint */}
          <div
            style={{
              position: "absolute",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              zIndex: 10,
              pointerEvents: "none",
              transition: "opacity 0.3s",
              opacity: isZoomed ? 0 : 1,
            }}
          >
            <ZoomIn size={14} />
            Click image to zoom
          </div>

          {/* Prev button */}
          {safeImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 8,
                padding: "12px 10px",
                cursor: "pointer",
                color: "white",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image container */}
          <div
            ref={imageRef}
            onClick={handleImageClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              position: "relative",
              width: "min(90vw, 1200px)",
              height: "min(85vh, 900px)",
              cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <Image
              src={safeImages[lightboxIndex]}
              alt={`${altText} ${lightboxIndex + 1}`}
              fill
              className="select-none"
              style={{
                objectFit: "contain",
                transformOrigin: isZoomed ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : "center center",
                transform: isZoomed
                  ? `scale(2.5) translate(${translate.x / 2.5}px, ${translate.y / 2.5}px)`
                  : "scale(1)",
                transition: isDragging ? "none" : "transform 0.25s ease",
                pointerEvents: "none",
                // Prevent default drag ghost
                WebkitUserDrag: "none",
              } as React.CSSProperties}
              sizes="min(90vw, 1200px)"
              priority
              draggable={false}
            />
          </div>

          {/* Next button */}
          {safeImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 8,
                padding: "12px 10px",
                cursor: "pointer",
                color: "white",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {safeImages.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 8,
                zIndex: 10,
                maxWidth: "90vw",
                overflowX: "auto",
                padding: "4px 8px",
              }}
            >
              {safeImages.map((src, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                    setIsZoomed(false);
                    setTranslate({ x: 0, y: 0 });
                  }}
                  style={{
                    position: "relative",
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    overflow: "hidden",
                    border: i === lightboxIndex ? "2px solid white" : "2px solid rgba(255,255,255,0.2)",
                    opacity: i === lightboxIndex ? 1 : 0.5,
                    cursor: "pointer",
                    padding: 0,
                    transition: "opacity 0.2s, border-color 0.2s",
                  }}
                  aria-label={`Go to image ${i + 1}`}
                >
                  <Image src={src} alt="" fill style={{ objectFit: "cover" }} sizes="48px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}