import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// BRANDING: RGS AI - Gemini/DeepSeek inspired
export const metadata: Metadata = {
  title: {
    default: "RGS AI",
    template: "%s | RGS AI"
  },
  description: "RGS AI - Your intelligent workspace. Free, fast, and private AI assistant.",
  applicationName: "RGS AI",
  authors: [{ name: "RGS AI" }],
  generator: "Next.js",
  keywords: ["AI", "assistant", "chat", "RGS", "workspace"],
  referrer: "origin-when-cross-origin",
  creator: "RGS AI",
  publisher: "RGS AI",
  
  // Manifest and icons
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Open Graph for social sharing
  openGraph: {
    title: "RGS AI - Your Intelligent Workspace",
    description: "Next-generation multimodal AI assistant. Secure, fast, and completely free.",
    url: "https://rgs-ai.com",
    siteName: "RGS AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RGS AI - Intelligent Workspace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter card
  twitter: {
    card: "summary_large_image",
    title: "RGS AI - Intelligent Workspace",
    description: "Next-generation multimodal AI assistant. Secure, fast, and completely free.",
    images: ["/twitter-image.png"],
    creator: "@rgs_ai",
    site: "@rgs_ai",
  },
  
  // App specific
  appleWebApp: {
    capable: true,
    title: "RGS AI",
    statusBarStyle: "black-translucent",
  },
  
  // Format detection
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  
  // Other metadata
  category: "technology",
  classification: "AI Assistant",
};

// VIEWPORT: Optimized for RGS Dark/Light themes
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Apple-specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Microsoft-specific */}
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PWA specific */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased overflow-hidden h-screen bg-background text-foreground selection:bg-blue-500/20 selection:text-white dark:selection:bg-blue-500/40`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="rgs-theme"
        >
          <div className="flex h-full flex-col overflow-hidden">
            {children}
          </div>
        </ThemeProvider>
        
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white dark:focus:bg-gray-900 focus:border focus:border-gray-200 dark:focus:border-gray-800 focus:rounded-md">
          Skip to main content
        </a>
      </body>
    </html>
  );
}