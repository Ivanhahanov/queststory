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
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#241a3d",
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
      <body className="min-h-full flex flex-col bg-background bg-quest-glow">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
