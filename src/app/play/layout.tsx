import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Квестория — игрок" },
  manifest: "/manifest-player.json",
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
