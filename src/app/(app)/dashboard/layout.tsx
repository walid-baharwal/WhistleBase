import { SidebarHeader } from "@/components/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarHeader />

          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
