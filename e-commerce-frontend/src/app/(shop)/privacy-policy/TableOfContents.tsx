// app/(shop)/privacy-policy/TableOfContents.tsx
"use client";

type Section = { title: string };

export default function TableOfContents({ sections }: { sections: Section[] }) {
  const scrollTo = (index: number) => {
    const el = document.getElementById(`section-${index}`);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="lg:sticky lg:top-20 bg-gray-50 rounded-2xl p-6 border border-gray-100">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Contents
      </h2>
      <ul className="space-y-1">
        {sections.map((section, i) => (
          <li key={i}>
            <button
              onClick={() => scrollTo(i)}
              className="text-sm text-gray-600 hover:text-black transition-colors duration-200 block py-1 text-left w-full cursor-pointer"
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
