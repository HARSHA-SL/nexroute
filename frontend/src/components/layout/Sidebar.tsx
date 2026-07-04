import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[280px] flex-col border-r border-[#2A2F36] bg-[#15181B]">
      <SidebarHeader />

      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>

      <SidebarFooter />
    </aside>
  );
}