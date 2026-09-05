import './globals.css';
import { DM_Sans, Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google';
import { Metadata } from "next";
import ReduxProvider from './ReduxProvider';
import { AppGateway } from './AppGateway';

export const metadata: Metadata = {
    title: "NovaCanvas Studios | Museum-Grade Fine Canvas Wall Art",
    description: "Curated collection of panoramic and modern canvas wall art. Handcrafted on 380gsm museum cotton canvas with heirloom floating frames.",
};

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600', '700'] });
const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-headline',
    weight: ['400', '600', '700', '800'],
});
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    variable: '--font-display',
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${dmSans.variable} ${plusJakarta.variable} ${cormorant.variable} ${dmSans.className} overflow-x-hidden`}
            >
                <ReduxProvider>
                    <AppGateway>
                        {children}
                    </AppGateway>
                </ReduxProvider>
            </body>
        </html>
    );
}

