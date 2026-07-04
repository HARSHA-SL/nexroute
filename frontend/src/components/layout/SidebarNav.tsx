import { NavLink } from "react-router-dom";
import { navigation } from "@/constants/navigation";

export default function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 px-3 py-5">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#23282F] text-white"
                  : "text-[#A7AFB8] hover:bg-[#1E2329] hover:text-white"
              }`
            }
          >
            <Icon size={18} />

            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}