import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="pt-[5rem] overflow-x-clip">{children}</main>
            <Footer />
        </>
    );
}

