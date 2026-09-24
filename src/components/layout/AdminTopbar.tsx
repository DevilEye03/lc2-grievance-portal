import { Bell } from "lucide-react";

interface AdminTopbarProps {
  title: string;
  userName: string;
}

export function AdminTopbar({ title, userName }: AdminTopbarProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
