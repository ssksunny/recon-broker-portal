"use client";

import { useRouter } from "next/navigation";
import type { BrokerLoadListItem } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";

/**
 * The broker-portal analog of recon-frontend's LoadsTable — no Carrier
 * column (a broker already knows which carrier they are), links to
 * /loads/[id] instead of /invoices/[id].
 */
export function LoadsTable({ loads }: { loads: BrokerLoadListItem[] }) {
  const router = useRouter();

  if (loads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500">
        No loads assigned to you yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Load #</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Pickup</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Delivery</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Linehaul</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loads.map((load) => (
            <tr
              key={load.id}
              onClick={() => router.push(`/loads/${load.id}`)}
              className="cursor-pointer transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium text-gray-900">{load.load_number}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(load.pickup_date)}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(load.delivery_date)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                {formatCurrency(load.linehaul_rate)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={load.match_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
