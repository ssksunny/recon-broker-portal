"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Deliberately no nav links beyond the logo — the broker portal has one
 * screen (My Loads) plus its detail view; a full sidebar nav would just be
 * empty chrome. Kept as its own component (rather than inlined in the
 * layout) so the shell stays consistent with recon-frontend's structure if
 * more sections get added later.
 */
export function Sidebar() {
  const { broker, logout } = useAuth();

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900">
          <span className="text-sm font-bold text-brand-500">R</span>
        </div>
        <div>
          <span className="block text-base font-semibold leading-tight text-gray-900">Recon</span>
          <span className="block text-xs leading-tight text-gray-400">Broker Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <span className="flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          My Loads
        </span>
      </nav>

      <div className="border-t border-gray-200 px-4 py-4">
        <p className="truncate text-sm font-medium text-gray-900">{broker?.full_name}</p>
        <p className="truncate text-xs text-gray-500">{broker?.email}</p>
        <button
          type="button"
          onClick={logout}
          className="mt-3 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
