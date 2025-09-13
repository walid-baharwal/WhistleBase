import Link from "next/link";

interface CaseLayoutProps {
  children: React.ReactNode;
}

export default function CaseLayout({ children }: CaseLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-4 px-6 border-b bg-background">
        <Link href="/" className="container mx-auto">
          <h1 className="text-3xl text-primary font-bold text-center">Whistle Base</h1>
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
