import Link from "next/link";
import { Cookie } from "lucide-react";

const sections = [
  {
    title: "1. What Are Cookies?",
    content: `Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They allow the website to recognise your device and remember certain information about your visit, such as your preferences and login status. Cookies are widely used to make websites work efficiently and to provide reporting information.`,
  },
  {
    title: "2. How TradeZone Uses Cookies",
    content: `TradeZone uses cookies to provide a better experience on our platform. Specifically, we use cookies to: keep you signed in between sessions; remember your search preferences and filters; track which listings you have recently viewed; measure how users interact with our platform so we can improve it; and detect and prevent fraudulent activity.`,
  },
  {
    title: "3. Types of Cookies We Use",
    content: `We use the following categories of cookies on TradeZone:

- Strictly Necessary Cookies: These are essential for the platform to function. They include session cookies that keep you logged in and security cookies that protect against fraud. You cannot opt out of these cookies.

- Functional Cookies: These remember your preferences such as your location, language, and saved filters to provide a more personalised experience.

- Analytics Cookies: These help us understand how visitors use TradeZone, which pages are most popular, and where users drop off. We use this data to improve our platform. The information collected is aggregated and anonymous.

- Preference Cookies: These remember choices you make (such as your preferred theme or saved searches) so you don't have to re-enter them each time you visit.`,
  },
  {
    title: "4. Third-Party Cookies",
    content: `Some cookies on TradeZone are set by third-party services that appear on our pages. For example, we may use authentication cookies from Google or Facebook when you sign in via those providers. These third parties have their own privacy policies and cookie practices. We do not control third-party cookies and recommend reviewing the respective privacy policies of those providers.`,
  },
  {
    title: "5. Cookie Duration",
    content: `Cookies can be either 'session cookies' or 'persistent cookies'. Session cookies are temporary and are deleted from your device when you close your browser. Persistent cookies remain on your device for a set period or until you delete them manually. Most of the cookies we use are session-based, but some functional and preference cookies may persist for up to 12 months.`,
  },
  {
    title: "6. Managing & Disabling Cookies",
    content: `You can control and manage cookies in several ways. Most browsers allow you to view, block, and delete cookies through your browser settings. Please note that if you disable strictly necessary cookies, some features of TradeZone, including staying logged in, may not work correctly. To manage cookies in your browser, refer to the help section of your browser (e.g., Chrome, Firefox, Safari, Edge).`,
  },
  {
    title: "7. Cookies and Your Consent",
    content: `By continuing to use TradeZone, you consent to our use of cookies as described in this policy. If you do not wish to accept cookies, you can adjust your browser settings to refuse them or stop using the platform. We may display a cookie consent notice when you first visit TradeZone, and you may update your preferences at any time.`,
  },
  {
    title: "8. Cookies and Nigerian Law",
    content: `Our use of cookies is consistent with the Nigeria Data Protection Regulation (NDPR) and the Nigeria Data Protection Act (NDPA). We are committed to handling any personal data collected through cookies in accordance with applicable Nigerian data protection laws. For more information, please refer to our Privacy Policy.`,
  },
  {
    title: "9. Changes to This Cookie Policy",
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we make changes, we will update the 'Last updated' date at the top of this page. We encourage you to review this policy periodically to stay informed about how we use cookies.`,
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions about our use of cookies, please contact us at privacy@tradezone.ng or visit our Contact page. We aim to respond to all privacy-related enquiries within 5 business days.`,
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/20 py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background text-xs font-medium text-primary mb-5">
            <Cookie className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-NG", { dateStyle: "long" })}
          </p>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            This policy explains what cookies are, how TradeZone uses them, and
            the choices you have regarding their use.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Quick summary cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              emoji: "🔐",
              title: "Strictly Necessary",
              desc: "Keep you logged in and the platform secure",
            },
            {
              emoji: "📊",
              title: "Analytics",
              desc: "Help us understand how TradeZone is used",
            },
            {
              emoji: "⚙️",
              title: "Functional",
              desc: "Remember your preferences and settings",
            },
          ].map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-4 text-center space-y-1.5"
            >
              <span className="text-2xl">{emoji}</span>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 p-5 rounded-2xl bg-muted/40 border text-sm text-muted-foreground space-y-2">
          <p>
            For more information about how we handle your personal data, read
            our{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            Have questions?{" "}
            <Link
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
