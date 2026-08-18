import type { Metadata, Viewport } from "next";
import { Golos_Text, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const golosText = Golos_Text({
  variable: "--font-sans",
  subsets: ["cyrillic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Квестория — панель ведущего",
    template: "%s · Квестория",
  },
  description: "Сюжетно-ролевые квесты: роли, цели, раунды и живое управление игрой",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Квестория",
  },
  other: {
    // Next 16 only emits the standardized `mobile-web-app-capable` from
    // `appleWebApp.capable` — Safari still ignores that and needs the legacy
    // apple-prefixed tag to launch installed PWAs without browser chrome.
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#181b20",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`dark ${golosText.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster
          position="top-center"
          theme="dark"
          offset="max(1rem, env(safe-area-inset-top))"
          toastOptions={{
            // sonner's dark theme defaults --normal-bg to pure black; setting
            // these as inline style beats that CSS-variable-driven default
            // without needing to fight specificity.
            style: {
              background: "var(--popover)",
              border: "1px solid var(--border)",
              color: "var(--popover-foreground)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 10px 30px -8px rgb(0 0 0 / 0.45)",
            },
            descriptionClassName: "text-muted-foreground",
          }}
        />
      </body>
    </html>
  );
}
