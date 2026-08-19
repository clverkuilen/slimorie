import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Outfit (geometric, rounded, energetic) drives headings; Inter carries body
// and UI text, where its high legibility at small sizes matters more than
// personality. See globals.css for how these map to --font-sans/--font-heading.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Slimorie",
    template: "%s",
  },
  description: "Open the app, log food, get on with your day.",
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
