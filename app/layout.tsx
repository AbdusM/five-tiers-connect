import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "We Up - Rapid Deployable Personal Relationship Management",
  description: "Stay on your feet. Be consistent. Be reliable. Your tool for rapid community connection and reentry success.",
};

import { CognitiveSupportWrapper } from '@/components/CognitiveSupportWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <CognitiveSupportWrapper>
          {children}
        </CognitiveSupportWrapper>
      </body>
    </html>
  )
}
