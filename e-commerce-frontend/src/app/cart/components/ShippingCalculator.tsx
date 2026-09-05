"use client";
import React, { useState } from 'react';

const ShippingCalculator = () => {
    const [zipCode, setZipCode] = useState('');
    const [shippingCost, setShippingCost] = useState<number | null>(null);

    const calculateShipping = (e: React.FormEvent) => {
        e.preventDefault();
        setShippingCost(9.99);
    };

    return (
        <div className="bg-white border border-border/60 p-6 mt-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c] mb-1">Estimate</p>
            <h2 className="font-display text-lg tracking-widest text-foreground mb-4">SHIPPING</h2>

            <form onSubmit={calculateShipping} className="space-y-3">
                <div>
                    <label htmlFor="zipCode" className="block text-xs text-muted-foreground mb-1.5 tracking-wide">
                        Postal Code
                    </label>
                    <input
                        type="text"
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full px-3 py-2.5 border border-border/70 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                        placeholder="e.g. 34000"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full border border-foreground/20 text-foreground text-[11px] tracking-widest uppercase py-2.5 hover:bg-muted transition-colors"
                >
                    Calculate
                </button>
            </form>

            {shippingCost !== null && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated cost</span>
                        <span className="font-semibold text-foreground">
                            {shippingCost.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingCalculator;
