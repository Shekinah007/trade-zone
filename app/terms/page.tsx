import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using TradeZone, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our platform. These terms apply to all users, including buyers, sellers, and visitors.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years of age to use TradeZone. By using this platform, you confirm that you meet this requirement and have the legal capacity to enter into binding agreements under Nigerian law.`,
  },
  {
    title: "3. Account Registration & Approval",
    content: `All accounts are subject to admin approval before sellers can post listings. You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and up-to-date information during registration and to notify us immediately of any unauthorized use of your account.`,
  },
  {
    title: "4. Listings & Content",
    content: `Sellers are solely responsible for the accuracy, legality, and quality of their listings. You agree not to post listings for prohibited items including but not limited to: stolen goods, counterfeit products, weapons, drugs, or any item whose sale is prohibited under Nigerian law. TradeZone reserves the right to remove any listing at its sole discretion.`,
  },
  {
    title: "5. Transactions",
    content: `TradeZone facilitates communication between buyers and sellers but is not a party to any transaction. We do not guarantee the quality, safety, legality, or availability of listed items. All transactions are conducted at your own risk. We strongly recommend following our Safety Tips before completing any purchase.`,
  },
  {
    title: "6. Prohibited Conduct",
    content: `You agree not to: use the platform for fraudulent or deceptive purposes; harass, threaten, or abuse other users; attempt to hack, scrape, or disrupt platform services; create multiple accounts to circumvent bans or suspensions; or engage in any activity that violates applicable Nigerian laws and regulations.`,
  },
  {
    title: "7. Intellectual Property",
    content: `All content on TradeZone including logos, design, and code is the property of TradeZone and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `TradeZone shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including losses resulting from transactions between users. Our total liability to you for any claim shall not exceed the fees you have paid to TradeZone in the 12 months preceding the claim.`,
  },
  {
    title: "9. Termination",
    content: `We reserve the right to suspend or terminate your account at any time for violation of these terms or for any conduct we deem harmful to the platform or its users. You may also delete your account at any time by contacting our support team.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from the use of TradeZone shall be subject to the exclusive jurisdiction of the courts of Nigeria.`,
  },
  {
    title: "11. Changes to Terms",
    content: `TradeZone reserves the right to update these terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We encourage you to review this page periodically.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/20 py-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-NG", { dateStyle: "long" })}
          </p>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Please read these terms carefully before using TradeZone. By using
            our platform, you agree to these terms.
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
          If you have questions about these terms, please{" "}
          <Link
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            contact us
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
