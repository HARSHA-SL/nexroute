import {
  Bell,
  Moon,
  Plus,
  Search,
  ChevronDown,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-[#2A2F36] bg-[#15181B] px-8">

      {/* Search */}

      <div className="relative w-[420px]">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B949E]"
        />

        <input
          placeholder="Search drivers, routes, warehouses..."
          className="h-11 w-full rounded-xl border border-[#2A2F36] bg-[#1B1F23] pl-11 pr-4 text-sm text-white outline-none transition-all focus:border-[#3B82F6]"
        />

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-4">

       

        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2F36] bg-[#1B1F23]">

          <Bell size={18} />

        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2F36] bg-[#1B1F23]">

          <Moon size={18} />

        </button>

        <button className="flex items-center gap-3 rounded-xl border border-[#2A2F36] bg-[#1B1F23] px-3 py-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-semibold">

            H

          </div>

          <div className="text-left">

            <p className="text-sm font-medium">

              Harsha

            </p>

            <p className="text-xs text-[#8B949E]">

              Admin

            </p>

          </div>

          <ChevronDown size={16} />

        </button>

      </div>

    </header>
  );
}