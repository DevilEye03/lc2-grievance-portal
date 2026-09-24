import { Bell } from "lucide-react";

interface AdminTopbarProps {
  title: string;
  userName: string;
}

export function AdminTopbar({ title, userName }: AdminTopbarProps) {
  return (
    <header className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 bg-white border-b border-gray-200 flex-shrink-0">
      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">{title}</h1>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-xs">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
