/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element, react/no-unescaped-entities */
// app/(shop)/about-us/page.tsx
import { Metadata } from "next";
import Feature from "../../products/components/Feature";

export const metadata: Metadata = {
  title: "About Us | NovaCanvas Studios - Museum-Grade Fine Canvas Wall Art",
  description:
    "Discover NovaCanvas Studios – your destination for museum-grade panoramic wall art, archival canvas prints, and handcrafted floating frames.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section — full bleed, no responsive-container */}
      <section className="relative bg-gray-900 text-white py-24 overflow-hidden">
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
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Curating Masterpieces That <br />
            <span className="text-gray-300">Transform Modern Spaces</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            At NovaCanvas Studios, we believe walls deserve fine art that moves the soul.
            From commanding panoramic centerpieces to textured abstract canvases,
            we engineer gallery-quality art built to last generations.
          </p>
        </div>
      </section>

      {/* Stats Section — full bleed */}
      <section className="bg-black text-white py-12">
        <div className="responsive-container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10,000+", label: "Frames Sold" },
            { value: "500+", label: "Frame Designs" },
            { value: "50+", label: "Cities Delivered" },
            { value: "4.9★", label: "Customer Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="responsive-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 block">
                Who We Are
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Born From a Passion for Architectural Elegance
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                NovaCanvas Studios was founded with one singular focus: elevating everyday living through panoramic and large-format canvas artworks. What began as an independent studio crafting bespoke commissions for interior designers quickly expanded into a premier fine art publisher.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Today, our studio curates hundreds of museum-grade editions — from fluid organic abstracts and serene nature landscapes to striking panoramic cityscapes. Every edition is printed on 380gsm archival cotton with UV-resistant pigment inks, hand-stretched over sustainably sourced kiln-dried timber chassis.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you are decorating an executive boardroom, luxury residence, or boutique hospitality setting — NovaCanvas Studios delivers statement pieces that command attention.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="/banner-image/ArtDrawing-removebg-preview.png"
                alt="NovaCanvas Studios Fine Wall Art"
                className="w-full max-w-2xl object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement — full bleed dark bg */}
      <section className="bg-gray-900 text-white py-20">
        <div className="responsive-container text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 block">
            Our Mission
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            "Making Every Wall a Work of Art"
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Our mission is simple — to help you celebrate every moment, every
            memory, and every milestone with a frame that does it justice. We
            are committed to delivering premium quality frames at prices that
            make beautiful homes accessible to everyone.
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            Shop Our Collection →
          </a>
        </div>
      </section>

      {/* What We Sell — light gray full bleed bg */}
      <section className="bg-gray-50 py-20">
        <div className="responsive-container">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 block">
              Our Products
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Frames for Every Occasion
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              We stock a curated range of premium frames suitable for homes,
              offices, studios, and gifting.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🖼️",
                title: "Photo Frames",
                desc: "Preserve your most cherished memories in beautifully crafted photo frames. Available in sizes from 4×6 to 24×36, in wood, metal, and acrylic finishes.",
              },
              {
                icon: "🎨",
                title: "Art Print Frames",
                desc: "Display your favourite art prints, posters, and digital prints in premium gallery-grade frames with UV-protective glass.",
              },
              {
                icon: "🏠",
                title: "Wall Décor Frames",
                desc: "Transform blank walls with our curated wall décor collections — shadow boxes, multi-frame sets, and personalised name frames.",
              },
              {
                icon: "💍",
                title: "Gift Frames",
                desc: "Give a gift that lasts forever. Our gift frames come in elegant packaging perfect for birthdays, anniversaries, and weddings.",
              },
              {
                icon: "🖼️",
                title: "Collage Frames",
                desc: "Tell your story with our stylish multi-photo collage frames — ideal for families, couples, and travel enthusiasts.",
              },
              {
                icon: "✨",
                title: "Custom Frames",
                desc: "Can't find the perfect fit? Order a fully customised frame — choose your size, material, colour, and finish — made just for you.",
              },
            ].map((product) => (
              <div
                key={product.title}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-3xl mb-4">{product.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {product.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Strip — Secure Payment, Free Shipping, etc. */}
      <section className="py-4">
        <div className="responsive-container">
          <Feature />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 border-t border-gray-100">
        <div className="responsive-container text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Have Questions? We're Here to Help.
          </h2>
          <p className="text-gray-500 mb-6">
            Reach out to our friendly support team — we'd love to help you find
            the perfect frame.
          </p>
          <a
            href="/support"
            className="inline-block bg-black text-white font-semibold px-8 py-3 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
