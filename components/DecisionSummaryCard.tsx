import type { MatchResult, MatchStatusValue } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatSignedCurrency, formatPercent } from "@/lib/format";

/** The AI decision, front and center: status, why, what to do about it, and the numbers behind it. */
export function DecisionSummaryCard({
  matchStatus,
  matchResult,
}: {
  matchStatus: MatchStatusValue;
  matchResult: MatchResult | null;
}) {
  if (!matchResult) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white px-5 py-5 text-sm text-gray-500">
        Recon hasn&apos;t matched this load yet — upload both a rate confirmation and an invoice to run the audit.
      </div>
    );
  }

  const variance = matchResult.variance != null ? Number(matchResult.variance) : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusBadge status={matchStatus} className="text-sm" />
          <span className="text-xs text-gray-400">Confidence {formatPercent(matchResult.confidence)}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-900">{matchResult.summary}</p>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2.5">
        <span className="mt-0.5 text-brand-600">→</span>
        <p className="text-sm font-medium text-gray-900">{matchResult.recommended_action}</p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 text-sm">
        <div>
          <dt className="text-xs text-gray-500">Rate con total</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-gray-900">{formatCurrency(matchResult.total_rate_con)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Invoiced total</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-gray-900">{formatCurrency(matchResult.total_invoiced)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Variance</dt>
          <dd className={"mt-0.5 font-medium tabular-nums " + (variance && variance !== 0 ? "text-rose-600" : "text-gray-900")}>
            {formatSignedCurrency(matchResult.variance)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
