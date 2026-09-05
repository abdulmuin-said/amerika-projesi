"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function JoinTheCollectiveSection() {
    const [email, setEmail] = useState("");
    const [fieldReady, setFieldReady] = useState(false);

    useEffect(() => {
        setFieldReady(true);
    }, []);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }
        toast.success("Thanks — we will be in touch.");
        setEmail("");
    }

    return (
        <section className="w-full bg-[oklch(0.16_0.02_55)] py-24 text-center text-neutral-100 md:py-32">
            <div className="responsive-container">
                <div className="mx-auto max-w-2xl">
                    <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#c9a84c]">
                        Stay in the loop
                    </p>
                    <h2 className="font-display mb-6 text-3xl font-bold tracking-tighter text-white md:text-4xl">
                        Join the Collective
                    </h2>
                    <p className="mb-10 text-sm text-white/50">
                        Access early release collections and architectural inspiration.
                    </p>
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex max-w-lg flex-col gap-0 border border-white/15 md:flex-row"
                    >
                        {fieldReady ? (
                            <input
                                type="email"
                                name="collective-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ENTER YOUR EMAIL"
                                autoComplete="email"
                                className="w-full border-0 bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/30 focus:ring-0 focus-visible:outline-none"
                            />
                        ) : (
                            <div className="w-full min-h-[52px] bg-transparent px-6 py-4" aria-hidden />
                        )}
                        <button
                            type="submit"
                            className="bg-[#c9a84c] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[oklch(0.16_0.02_55)] transition-colors hover:bg-[#d9b85c]"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
