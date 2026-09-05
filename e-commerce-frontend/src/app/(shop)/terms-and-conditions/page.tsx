/* eslint-disable react/no-unescaped-entities */
// app/(shop)/terms-and-conditions/page.tsx
import { Metadata } from "next";
import TableOfContents from "./TableOfContents";

export const metadata: Metadata = {
  title: "Terms & Conditions | NovaCanvas Studios",
  description:
    "Read the Terms and Conditions for NovaCanvas Studios. Policies on museum-grade canvas orders, Stripe payments, nationwide US delivery, and returns.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing, browsing, or placing an order with NovaCanvas Studios (“NovaCanvas”, “we”, “us”, or “our”), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.",
      "These Terms govern all visitors, clients, and orders placed through our digital gallery and white-label showcase platforms. We reserve the right to revise or update these terms at our discretion.",
    ],
  },
  {
    title: "2. Artwork Specifications & Custom Orders",
    content: [
      "All wall art pieces offered on NovaCanvas Studios are handcrafted with archival pigment inks on 380gsm cotton canvas. Dimensions and framing choices are specified by the customer during configuration.",
      "When an order is submitted, it enters our studio workflow. Because each canvas is custom printed and hand-stretched over solid pine chassis, order modifications should be communicated within 12 hours of placement.",
    ],
  },
  {
    title: "3. Pricing & Currency",
    content: [
      "All pricing across NovaCanvas Studios is billed strictly in United States Dollars ($ / USD). Any applicable sales taxes or delivery options are clearly itemized prior to final payment authorization.",
      "Payments are processed securely via Stripe. We support major credit cards (Visa, MasterCard, American Express, Discover), Apple Pay, and Google Pay with Level 1 PCI-DSS encryption.",
    ],
  },
  {
    title: "4. US Domestic & Global Shipping",
    content: [
      "NovaCanvas Studios ships nationwide across all 50 US states via FedEx and UPS Ground (3–5 business days) and Express Air. International orders are fulfilled via DHL Express.",
      "All canvases are packaged with archival protective layers, impact-resistant corner cushions, and reinforced timber packaging to ensure damage-free transit.",
    ],
  },
  {
    title: "5. Safe Arrival Guarantee & 30-Day Returns",
    content: [
      "We provide an unconditional 100% Safe Arrival Guarantee. If your artwork sustains any transit damage, provide photo verification within 48 hours and we will manufacture and dispatch a brand-new replacement at zero cost.",
      "Standard collection pieces may be returned within 30 days of delivery in their original packaging for a full refund back to your payment method.",
    ],
  },
  {
    title: "6. Intellectual Property",
    content: [
      "All original artwork visuals, high-resolution compositions, brand marks, and digital assets on NovaCanvas Studios are proprietary intellectual property protected under United States and international copyright statutes.",
    ],
  },
  {
    title: "7. Privacy & Data Security",
    content: [
      "Your privacy is paramount. We never sell, lease, or distribute customer information to third-party data brokers. Financial transactions are tokenized directly through Stripe.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    content: [
      "NovaCanvas Studios shall not be liable for any incidental, punitive, or consequential damages arising from site interaction or shipping delays beyond carrier control.",
    ],
  },
  {
    title: "9. Governing Law & Jurisdiction",
    content: [
      "These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflicts of law principles.",
    ],
  },
  {
    title: "10. Studio Concierge & Contact",
    content: [
      "For inquiries, corporate licensing, or custom sizing requests, please contact our studio advisory team at concierge@novacanvas.com or through our dedicated Support Portal.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="responsive-container relative text-center">
          <span className="inline-block bg-white text-gray-900 text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before exploring NovaCanvas Studios or
            placing an order. They govern your use of our platform and services.
          </p>
          <p className="text-gray-400 text-sm mt-6">Last updated: March 2026</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="responsive-container">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Sticky Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <TableOfContents sections={sections} />
            </aside>

            {/* Sections */}
            <div className="flex-1 min-w-0">
              <div className="space-y-10">
                {sections.map((section, i) => (
                  <div
                    key={i}
                    id={`section-${i}`}
                    className="pb-10 border-b border-gray-100 last:border-0"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.content.map((para, j) => (
                        <p
                          key={j}
                          className="text-gray-600 leading-relaxed text-[15px]"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="responsive-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
            We believe in transparency. If anything in these terms is unclear,
            our support team is always ready to assist you.
          </p>
          <a
            href="/support"
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            Contact Support →
          </a>
        </div>
      </section>
    </div>
  );
}
