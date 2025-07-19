interface AccessLayoutProps {
  children: React.ReactNode;
}

export default function AccessLayout({ children }: AccessLayoutProps) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
