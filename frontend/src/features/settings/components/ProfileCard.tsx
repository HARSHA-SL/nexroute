import { User } from "lucide-react";
import type { Settings } from "../types/settings";

interface Props {
  settings: Settings;
}

export default function ProfileCard({ settings }: Props) {
  return (
    <div className="rounded-xl border border-[#262B34] bg-[#171B22] p-6">
      <div className="flex items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
          <User size={30} color="white" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Harsha</h2>
          <p className="text-gray-400">Administrator</p>
          <p className="mt-2 text-sm text-gray-500">admin@nexroute.ai</p>
          <p className="text-sm text-gray-500">+91 9876543210</p>
        </div>
      </div>
    </div>
  );
}