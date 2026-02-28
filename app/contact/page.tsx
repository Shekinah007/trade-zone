"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  MessageSquare,
  Twitter,
  Instagram,
  Facebook,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

const faqs = [
  {
    q: "How do I create a listing?",
    a: "After your account is approved, go to 'Post an Ad' from the navigation menu. Fill in your item details, upload photos, and submit.",
  },
  {
    q: "How long does account approval take?",
    a: "Account approvals are typically processed within 24–48 hours. You'll be able to browse the platform while you wait.",
  },
  {
    q: "How do I report a suspicious listing?",
    a: "On any listing page, scroll down and click 'Report this listing'. Provide a description and our team will review it promptly.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. We do not sell your data to third parties. Read our Privacy Policy for full details on how we handle your information.",
  },
  {
    q: "How do I contact a seller?",
    a: "On a listing page, click 'Contact Seller' to chat in-app, send a WhatsApp message, or call directly if the seller has added a phone number.",
  },
];

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setSending(true);
    // Replace with your actual email/API endpoint
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    form.reset();
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/20 py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium text-primary mb-4">
            <MessageSquare className="h-3 w-3" /> We're here to help
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Contact Us
          </h1>
          <p className="text-muted-foreground">
            Have a question, concern, or feedback? Reach out to the TradeZone
            team and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-4">Get in touch</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: "support@tradezone.ng",
                    href: "mailto:support@tradezone.ng",
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+234 800 000 0000",
                    href: "tel:+2348000000000",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 group"
                  >
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-3">Follow us</p>
              <div className="flex gap-2">
                {[
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Facebook, href: "#", label: "Facebook" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="p-2.5 rounded-xl border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 border p-4 text-sm space-y-1">
              <p className="font-semibold">Support Hours</p>
              <p className="text-muted-foreground text-xs">
                Monday – Friday: 9am – 6pm WAT
              </p>
              <p className="text-muted-foreground text-xs">
                Saturday: 10am – 2pm WAT
              </p>
              <p className="text-muted-foreground text-xs">Sunday: Closed</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-5">Send a message</h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="How can we help?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your issue or question in detail..."
                            className="resize-none min-h-[130px]"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center">
                          <FormMessage />
                          <span className="text-xs text-muted-foreground ml-auto">
                            {field.value?.length || 0} chars
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={sending}
                  >
                    {sending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mb-6">
            Quick answers to common questions.
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-xl px-4"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
