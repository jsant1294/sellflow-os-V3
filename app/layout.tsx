import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SellFlow OS Final V3",
  description: "Local selling command center for Facebook Marketplace, OfferUp, and Nextdoor.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
