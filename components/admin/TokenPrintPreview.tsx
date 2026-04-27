"use client";

import { X, Printer, ShieldCheck, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

interface RechargeToken {
  _id: string;
  code: string;
  tokenType: string;
  value: number;
}

interface Props {
  tokens: RechargeToken[];
  onClose: () => void;
}

export default function TokenPrintPreview({ tokens, onClose }: Props) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const printDate = format(new Date(), "MMM d, yyyy");

  // Prevent scrolling on the body while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrint = async () => {
    if (!printableRef.current) return;

    try {
      setIsGenerating(true);
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const element = printableRef.current;

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 format is 210 x 297 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`findmaster-tokens-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (tokens.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white sm:bg-black/50 flex flex-col sm:p-6 overflow-hidden">
      {/* Modal Container */}
      <div className="flex-1 bg-gray-50 sm:rounded-xl shadow-2xl flex flex-col overflow-hidden w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div>
            <h2 className="text-lg font-bold">PDF Print Preview</h2>
            <p className="text-sm text-muted-foreground">
              {tokens.length} token{tokens.length > 1 ? "s" : ""} selected for
              printing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-8 flex justify-center bg-gray-200">
          {/* Printable Sheet (Fixed width, not affected by screen) */}
          <div
            ref={printableRef}
            className="bg-white p-6 shadow-lg shrink-0"
            style={{
              width: "210mm",
              minHeight: "297mm",
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
              margin: "0 auto",
            }}
          >
            {/* Header with print-friendly styling */}
            <div className="mb-8 pb-4 border-b-2 border-gray-300 flex justify-between items-center print:mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  FindMaster Recharge Tokens
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Official Property Registry Vouchers
                </p>
              </div>
              <div className="text-sm text-gray-500 text-right">
                <p>Generated: {printDate}</p>
                <p className="font-semibold text-gray-700 mt-1">
                  Total: {tokens.length} tokens
                </p>
              </div>
            </div>

            {/* Card Grid - Fixed layout with absolute card sizes */}
            <div
              className="grid grid-cols-2 gap-5 print:gap-4"
              style={{ maxWidth: "100%" }}
            >
              {tokens.map((token, index) => (
                <div
                  key={token._id}
                  className="relative group print:break-inside-avoid"
                  style={{
                    pageBreakInside: "avoid",
                    breakInside: "avoid",
                    width: "95mm", // Fixed width per card (A4 width is 210mm, minus padding = ~95mm per card)
                  }}
                >
                  {/* Cutting Guide Lines */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-l-2 border-t-2 border-gray-300 print:border-gray-400 z-20" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-r-2 border-t-2 border-gray-300 print:border-gray-400 z-20" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l-2 border-b-2 border-gray-300 print:border-gray-400 z-20" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r-2 border-b-2 border-gray-300 print:border-gray-400 z-20" />

                  {/* Card Content - Fixed height */}
                  <div
                    className="relative overflow-hidden border-2 border-gray-200 rounded-xl bg-white p-4 transition-all duration-200 hover:shadow-md"
                    style={{
                      height: "180px", // Fixed height
                      width: "100%",
                      printColorAdjust: "exact",
                      WebkitPrintColorAdjust: "exact",
                    }}
                  >
                    {/* Subtle background pattern for print */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500 rounded-full blur-2xl" />
                    </div>

                    {/* Decorative strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-green-500" />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-600 rounded-lg shadow-sm flex items-center justify-center">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 leading-tight text-sm">
                              FindMaster
                            </h3>
                            <p className="text-[8px] text-gray-500 font-medium uppercase tracking-wider">
                              Property Registry
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                              token.tokenType === "unlimited"
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-green-100 text-green-700 border border-green-200"
                            }`}
                          >
                            {token.tokenType === "unlimited"
                              ? "♾️ UNLIMITED"
                              : `+${token.value} PROPS`}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-dashed border-gray-200" />

                      {/* PIN Code Section - Prominent */}
                      <div className="flex-1 flex flex-col justify-center items-center py-2">
                        <p className="text-[8px] text-gray-400 uppercase font-semibold mb-1.5 tracking-wider">
                          Recharge PIN
                        </p>
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg py-2 px-3 w-full text-center">
                          <code className="text-base font-mono font-bold text-gray-800 tracking-[0.1em] break-all">
                            {token.code.match(/.{1,4}/g)?.join("-") ||
                              token.code}
                          </code>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-dashed border-gray-200 " />

                      {/* Footer Section */}
                      <div className="flex justify-between items-end pt-1">
                        <div>
                          <p className="text-[7px] text-gray-400 font-medium">
                            ID: {token._id.slice(-8)}
                          </p>
                          <p className="text-[7px] text-gray-400 mt-0.5">
                            {printDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] text-gray-500">Redeem at</p>
                          <p className="text-[8px] font-semibold text-red-600">
                            findmaster.com/redeem
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Perforation/Cutting Guide between cards */}
                  {index % 2 === 1 && index !== tokens.length - 1 && (
                    <div className="hidden print:block absolute -bottom-2 left-0 right-0 text-center">
                      <div className="inline-block px-2 text-[8px] text-gray-400 bg-white">
                        ✂ --- cut here --- ✂
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer with cutting instructions */}
            <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center print:mt-4">
              <p className="text-[10px] text-gray-400">
                ✂ Cut along the corner marks to separate individual tokens. Each
                token is valid for one-time use only.
              </p>
              <p className="text-[9px] text-gray-400 mt-2">
                For assistance, contact support@findmaster.com | FindMaster
                Property Registry System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
