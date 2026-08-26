import type { LineItemOut } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatSignedCurrency, titleCase } from "@/lib/format";

/**
 * The line-by-line audit result: what was billed, what Recon expected, the
 * variance, and — most importantly for a reviewer moving fast — why. Each
 * row's reason is the whole point of this table; nothing here should force
 * a reviewer back to the source PDFs just to understand a flag.
 */
export function LineItemsTable({ lineItems }: { lineItems: LineItemOut[] }) {
  if (lineItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">
        No line items yet — matching runs once both a rate confirmation and an invoice are on file.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Charge</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Rate Con</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Invoiced</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Variance</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Decision</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lineItems.map((li) => (
            <tr key={li.id} className={li.match_status !== "clean" ? "bg-rose-50/30" : undefined}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {titleCase(li.line_type)}
                {li.description && <span className="block text-xs font-normal text-gray-500">{li.description}</span>}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                {li.expected_amount != null ? formatCurrency(li.expected_amount) : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-900">{formatCurrency(li.billed_amount)}</td>
              <td
                className={
                  "px-4 py-3 text-right tabular-nums font-medium " +
                  (li.variance_amount == null
                    ? "text-gray-400"
                    : Number(li.variance_amount) === 0
                    ? "text-gray-500"
                    : "text-rose-600")
                }
              >
                {li.variance_amount != null ? formatSignedCurrency(li.variance_amount) : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={li.match_status} />
              </td>
              <td className="max-w-xs px-4 py-3 text-gray-600">{li.match_reason ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
