import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, including your name, email address, phone number, profile photo, and any content you upload to the platform. We also collect usage data such as pages visited, search queries, listings viewed, and device/browser information to improve our services.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to: operate and improve the TradeZone platform; process and display your listings; facilitate communication between buyers and sellers; send account-related notifications and updates; detect and prevent fraud or abuse; and comply with applicable Nigerian laws and regulations.`,
  },
  {
    title: "3. Sharing Your Information",
    content: `We do not sell your personal information to third parties. We may share your information with: other users as necessary to facilitate transactions (e.g. your name and listing details are visible publicly); service providers who help us operate the platform under strict confidentiality obligations; and law enforcement or regulatory bodies when required by Nigerian law.`,
  },
  {
    title: "4. Data Retention",
    content: `We retain your personal information for as long as your account is active or as necessary to provide our services. If you delete your account, we will remove your personal data within 30 days, except where retention is required for legal or compliance purposes.`,
  },
  {
    title: "5. Cookies",
    content: `TradeZone uses cookies and similar technologies to maintain your session, remember preferences, and analyze platform usage. You can control cookie settings through your browser, although disabling cookies may affect some platform functionality.`,
  },
  {
    title: "6. Data Security",
    content: `We implement industry-standard security measures including encryption, secure connections (HTTPS), and access controls to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "7. Your Rights",
    content: `Under applicable Nigerian data protection regulations (NDPR), you have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data; object to certain processing activities; and withdraw consent where processing is based on consent. To exercise these rights, contact us at privacy@tradezone.ng.`,
  },
  {
    title: "8. Third-Party Links",
    content: `Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies before providing any personal information.`,
  },
  {
    title: "9. Children's Privacy",
    content: `TradeZone is not intended for use by persons under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will delete it promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform. Your continued use of TradeZone after changes are posted constitutes your acceptance of the revised policy.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/20 py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-NG", { dateStyle: "long" })}
          </p>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Your privacy matters to us. This policy explains how TradeZone
            collects, uses, and protects your personal information.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold mb-2">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-2xl bg-muted/40 border text-sm text-muted-foreground">
          For privacy-related inquiries, email us at{" "}
          <a
            href="mailto:privacy@tradezone.ng"
            className="text-primary hover:underline font-medium"
          >
            privacy@tradezone.ng
          </a>{" "}
          or visit our{" "}
          <Link
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            contact page
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
