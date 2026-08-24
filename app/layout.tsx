import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Source_Serif_4, Caveat } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["600", "700"],
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
        url: "/opengraph-image.png",
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
    images: ["/opengraph-image.png"],
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
      className={`${sourceSerif.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-0PK21H0NP4"
    strategy="afterInteractive"
  />

  <Script id="google-analytics" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-0PK21H0NP4');
    `}
  </Script>

  <Navbar />

  <main>
    {children}
  </main>

  <Footer />
</body>
    </html>
  );
}