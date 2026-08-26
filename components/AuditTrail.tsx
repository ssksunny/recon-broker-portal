import type { AuditLogEntry } from "@/lib/types";
import { formatCurrency, formatDateTime, formatPercent, titleCase } from "@/lib/format";

const EVENT_META: Record<string, { label: string; dot: string }> = {
  document_received: { label: "Document received", dot: "bg-gray-400" },
  extraction_completed: { label: "Extraction completed", dot: "bg-blue-500" },
  extraction_failed: { label: "Extraction failed", dot: "bg-rose-500" },
  match_decision: { label: "Recon matched this load", dot: "bg-violet-500" },
  match_failed: { label: "Matching failed", dot: "bg-rose-500" },
  carrier_assigned: { label: "Portal access granted", dot: "bg-emerald-500" },
  carrier_unassigned: { label: "Portal access revoked", dot: "bg-gray-400" },
  broker_response: { label: "You responded", dot: "bg-emerald-500" },
};

function EventDetail({ entry }: { entry: AuditLogEntry }) {
  const d = entry.details ?? {};

  switch (entry.event_type) {
    case "document_received":
      return (
        <p className="text-gray-600">
          {d.doc_type ? titleCase(d.doc_type) : "Document"}
          {d.filename ? ` — ${d.filename}` : ""}
        </p>
      );
    case "extraction_completed": {
      const warnings: string[] = Array.isArray(d.warnings) ? d.warnings : [];
      return (
        <div>
          <p className="text-gray-600">Confidence {formatPercent(d.confidence)}</p>
          {warnings.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {warnings.map((w, i) => (
                <li key={i} className="text-amber-600">⚠ {w}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    case "extraction_failed":
    case "match_failed":
      return <p className="text-rose-600">{d.error ?? "Unknown error."}</p>;
    case "match_decision":
      return (
        <div>
          <p className="text-gray-900">{d.summary}</p>
          <p className="mt-1 text-xs text-gray-500">
            Rate con {formatCurrency(d.total_rate_con)} · Invoiced {formatCurrency(d.total_invoiced)} · Variance{" "}
            {formatCurrency(d.variance)}
          </p>
        </div>
      );
    case "broker_response":
      return <p className="text-gray-900">&ldquo;{d.message}&rdquo;</p>;
    default:
      return null;
  }
}

/**
 * A load's activity timeline, scoped to what a broker is meant to see:
 * documents received and extracted, Recon's match decision and its
 * reasoning, portal-access changes, and the broker's own past responses —
 * filtered server-side to exclude internal reviewer deliberation (see
 * app.services.audit_service.list_audit_log_for_load_broker_view on the
 * backend).
 */
export function AuditTrail({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-8 text-center text-sm text-gray-500">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 pl-5">
      {entries.map((entry) => {
        const meta = EVENT_META[entry.event_type] ?? { label: titleCase(entry.event_type), dot: "bg-gray-400" };
        return (
          <li key={entry.id} className="mb-4 last:mb-0">
            <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${meta.dot}`} />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-sm font-medium text-gray-900">{meta.label}</span>
              <span className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</span>
            </div>
            <div className="mt-0.5 text-sm">
              <EventDetail entry={entry} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
