import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/components/TrpcProvider";
import AuthProvider from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: "Whistle Base",
  description: "Your application description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
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
