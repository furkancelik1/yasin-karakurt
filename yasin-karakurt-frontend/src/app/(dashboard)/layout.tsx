import { Sidebar }         from '@/components/dashboard/Sidebar';
import { Topbar }          from '@/components/dashboard/Topbar';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-obsidian">
      {/* ── Sidebar — desktop only ── */}
      <Sidebar />

      {/* ── Ana içerik ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Bottom nav — mobile only ── */}
      <MobileBottomNav />
    </div>
  );
}
