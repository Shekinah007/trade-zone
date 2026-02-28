"use client";

import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  CreditCard,
  Award,
  Tag,
  QrCode,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BusinessViewProps {
  data: any;
  onEdit: () => void;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-muted shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-medium break-words ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
      {title}
    </p>
  );
}

export function BusinessView({ data, onEdit }: BusinessViewProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">No business profile yet</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Set up your business profile to show buyers who you are.
        </p>
        <Button onClick={onEdit} className="rounded-full">
          <Pencil className="h-4 w-4 mr-2" /> Create Business Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Business header */}
      <div className="flex items-start gap-4">
        {data.image ? (
          <img
            src={data.image}
            alt={data.name}
            className="h-16 w-16 rounded-xl object-cover border shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold">{data.name}</h2>
          {data.type && (
            <Badge variant="secondary" className="mt-1 text-xs capitalize">
              {data.type}
            </Badge>
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Contact & Location */}
      {(data.email || data.phone || data.address || data.businessHours) && (
        <div className="space-y-4">
          <Section title="Contact & Location" />
          <div className="grid sm:grid-cols-2 gap-4">
            {data.email && (
              <InfoRow icon={Mail} label="Email" value={data.email} />
            )}
            {data.phone && (
              <InfoRow icon={Phone} label="Phone" value={data.phone} />
            )}
            {data.address && (
              <InfoRow icon={MapPin} label="Address" value={data.address} />
            )}
            {data.businessHours && (
              <InfoRow icon={Clock} label="Hours" value={data.businessHours} />
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      {data.categories?.length > 0 && (
        <>
          <Separator />
          <div>
            <Section title="Categories" />
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat: string) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm"
                >
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Socials */}
      {data.socials?.length > 0 && (
        <>
          <Separator />
          <div>
            <Section title="Social Links" />
            <div className="space-y-2">
              {data.socials.map((s: any, i: number) => (
                <a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-background">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground capitalize">
                      {s.name}
                    </p>
                    <p className="text-sm font-medium truncate text-primary">
                      {s.link}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bank Details */}
      {data.bankDetails?.length > 0 && (
        <>
          <Separator />
          <div>
            <Section title="Bank Details" />
            <div className="space-y-2">
              {data.bankDetails.map((b: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/40"
                >
                  <div className="p-1.5 rounded-lg bg-background">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{b.name}</p>
                    <p className="text-sm font-mono font-medium">{b.account}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <>
          <Separator />
          <div>
            <Section title="Certifications" />
            <div className="space-y-2">
              {data.certifications.map((cert: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20"
                >
                  <Award className="h-4 w-4 text-yellow-500 shrink-0" />
                  <span className="text-sm font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* QR Code */}
      {data.qrCode && (
        <>
          <Separator />
          <div>
            <Section title="QR Code" />
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <div className="p-1.5 rounded-lg bg-background">
                <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">QR Code URL</p>
                <p className="text-sm truncate">{data.qrCode}</p>
              </div>
              <a
                href={data.qrCode}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline shrink-0"
              >
                View
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
