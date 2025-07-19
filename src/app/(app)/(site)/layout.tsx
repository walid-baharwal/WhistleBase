interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
