import type { Metadata } from "next";
import { Oxanium, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/components/TrpcProvider";
import AuthProvider from "@/providers/auth-provider";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif", 
  weight: ["300", "400", "700", "900"],
  display: "swap",
  preload: false,
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});


export const metadata: Metadata = {
  title: 'Whistle Base',
  description: 'Your application description',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oxanium.variable} ${merriweather.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <TrpcProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>

 

            {children}
            <Toaster richColors position={"top-right"} />
            </AuthProvider>
          </ThemeProvider>
        </TrpcProvider>

        <Toaster />
      </body>
    </html>
  );
}
