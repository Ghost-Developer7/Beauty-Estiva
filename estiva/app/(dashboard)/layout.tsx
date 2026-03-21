import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="estiva-dashboard flex min-h-screen">
      <Sidebar />
      <div className="estiva-dashboard-panel flex flex-1 flex-col">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-6 py-10">{children}</div>
      </div>
    </div>
  );
}
