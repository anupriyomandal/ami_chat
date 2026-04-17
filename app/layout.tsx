import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "AMIChat",
  description: "A minimal ChatGPT clone powered by OpenRouter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: 0,
              border: "2px solid #0a0a23",
              background: "#ffffff",
              color: "#0a0a23",
              fontWeight: 500,
            },
          }}
        />
      </body>
    </html>
  );
}
