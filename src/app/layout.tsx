import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabelBee - Student Name Slip Generator",
  description: "Create and print beautiful notebook name slips & labels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}


