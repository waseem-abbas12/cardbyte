import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cardbyte | Trade Gift Cards Instantly with Best Rates & Fast Payouts",
  description: "Sell unused gift cards for Crypto (USDT, BTC, SOL) or Local Fiat (USD, EUR, NGN, GHS) with automated live valuation, bank-grade encryption, and rapid settlement.",
  keywords: "sell gift cards, buy gift cards, gift card to crypto, trade gift cards for USDT, Cardbyte, gift card exchange",
  openGraph: {
    title: "Cardbyte | Instant Gift Card Exchange",
    description: "Exchange Apple, Steam, Amazon, Razer Gold, Xbox, and PlayStation gift cards instantly.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg text-brand-text flex flex-col antialiased selection:bg-brand-primary selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
