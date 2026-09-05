// app/(shop)/shipping-returns/page.tsx
import { Metadata } from "next";
import TableOfContents from "./TableOfContents";

export const metadata: Metadata = {
  title: "Shipping & Returns | NovaCanvas Studios",
  description:
    "Nationwide US Delivery, 30-Day Returns, and Safe Arrival Guarantee for NovaCanvas Studios.",
};

const sections = [
  {
    title: "1. US Nationwide & Global Shipping Policy",
    content: [
      "**📦 Handcrafted Production & Dispatch**\nEvery canvas artwork is custom printed and hand-stretched to order in our studio.\nProduction time: 1–3 business days.\nUS Standard Delivery: 3–5 business days via FedEx / UPS Ground.\nUS Express Air: 2 business days via FedEx Priority.",
      "**🌍 International Express Shipping**\nWe ship to Canada, the United Kingdom, the European Union, Australia, and 45+ countries worldwide via DHL Express (3–7 business days). Real-time tracking is provided upon dispatch.",
      "**🛡️ Archival Armor Packaging**\nEvery canvas is wrapped in acid-free tissue, fitted with custom corner protectors, and securely packed in reinforced timber-backed corrugated cartons engineered specifically for fine art transit."
    ],
  },
  {
    title: "2. 100% Safe Arrival Guarantee",
    content: [
      "**✨ Unconditional Transit Protection**\nWe believe art should arrive in pristine gallery condition. In the rare event that your canvas or frame sustains damage during transit, you are 100% protected.",
      "**📸 Hassle-Free Replacement**\nSimply photograph the package and damaged artwork within 48 hours of delivery and email our team at concierge@novacanvas.com. We will manufacture and rush an identical replacement to your door free of charge."
    ],
  },
  {
    title: "3. 30-Day Satisfaction Guarantee & Returns",
    content: [
      "**🔄 30-Day Home Trial**\nWe want you to love your art. If you are not completely enchanted with your canvas, you may return standard catalog items within 30 days of receipt.",
      "**Conditions for Return:**\n• Artwork must be in original condition with mounting hardware included.\n• Must be securely packed in original or equivalent protective packaging.\n• Once received and inspected, refunds are credited back to your original payment method within 3–5 business days."
    ],
  },
  {
    title: "4. Terms of Sale & Order Confirmation",
    content: [
      "**💳 Secure Transactions**\nOrders are processed upon verification through Stripe's certified PCI-DSS Level 1 compliant gateway. Prices are billed in US Dollars ($ / USD).",
      "**⚖️ Governing Terms**\nBy placing an order on NovaCanvas Studios, you confirm that your shipping address and dimensions are correct. Our concierge team is available 7 days a week to assist with order adjustments prior to printing."
    ],
  }
];

export default function ShippingReturnsPage() {
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
            Customer Care
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Policies & Agreements
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
            Distance Sales Agreement and Shipping & Return Policy
          </p>
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
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.content.map((para, j) => {
                        // Simple parser for bold text (**text**) and newlines (\n)
                        return (
                          <div key={j} className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">
                            {para.split("**").map((part, index) => 
                              index % 2 === 1 ? <strong key={index} className="text-gray-900 font-semibold">{part}</strong> : part
                            )}
                          </div>
                        );
                      })}
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
            Still Have Questions?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
            If you need further assistance with your order, shipping, or returns, our customer service team is here to help.
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
