import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar: Desktop only */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 z-50">
        <Sidebar />
      </div>

      {/* Mobile Sidebar is handled inside Sidebar component */}

      {/* Ana İçerik */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative">
        {/* Mobile Header is handled inside Sidebar component */}
        
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}

        <Topbar />
        <main className="flex-1 md:p-8 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}