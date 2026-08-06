import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thelongwayhome.dev"),

  title: {
    default: "The Long Way Home • Prateek Pal",
    template: "%s • The Long Way Home",
  },

  description:
    "Building thoughtful software, writing about books, mountains and ideas, and documenting the long way home.",

  applicationName: "P²",

  authors: [
    {
      name: "Prateek Pal",
      url: "https://thelongwayhome.dev",
    },
  ],

  creator: "Prateek Pal",
  publisher: "Prateek Pal",

  category: "Technology",

  robots: {
    index: true,
    follow: true,
  },

  keywords: [
    "Prateek Pal",
    "P²",
    "P Square",
    "Developer",
    "Next.js",
    "Flutter",
    "Journal",
    "Prime",
    "Wayfarer",
    "Dharchula",
    "Himalayas",
  ],

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title: "The Long Way Home",
    description:
      "Building thoughtful software, writing about books, mountains and ideas, and documenting the long way home.",
    url: "https://thelongwayhome.dev",
    siteName: "The Long Way Home",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Long Way Home",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "The Long Way Home",
    description:
      "Building thoughtful software, writing about books, mountains and ideas, and documenting the long way home.",
    images: ["/opengraph-image"],
  },

  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2EEE7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}