import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C in 7 Days | IIST C Programming Masterclass by Mr. Ashish Singh",
  description: "Official registration portal for the free 7-Day intensive C programming masterclass at Indore Institute of Science and Technology (IIST). Limited seats on First-Come First-Serve basis.",
  keywords: ["IIST", "C in 7 Days", "Ashish Singh", "C Programming", "Indore Institute of Science and Technology", "Coding Bootcamp"],
  openGraph: {
    title: "C in 7 Days | IIST Masterclass",
    description: "Enroll in the free 7-day intensive C programming masterclass conducted by Mr. Ashish Singh.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
