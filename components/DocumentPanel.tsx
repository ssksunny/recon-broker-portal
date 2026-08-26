"use client";

import { useState } from "react";
import type { DocumentOut, DocumentType } from "@/lib/types";
import { formatCurrency, formatDateTime, formatDate, formatPercent } from "@/lib/format";
import { openDocumentPreview, previewErrorMessage } from "@/lib/preview";

const PANEL_LABELS: Record<DocumentType, string> = {
  rate_confirmation: "Rate Confirmation",
  invoice: "Invoice",
  pod: "POD",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

function ExtractionFooter({ document }: { document: DocumentOut }) {
  const warnings: string[] = Array.isArray(document.extracted_data?.warnings) ? document.extracted_data.warnings : [];
  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs text-gray-400">
        Extraction confidence:{" "}
        {document.extraction_confidence != null ? formatPercent(document.extraction_confidence) : "—"}
      </p>
      {warnings.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="text-xs text-amber-600">
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RateConfirmationBody({ document }: { document: DocumentOut }) {
  const d = document.extracted_data ?? {};
  const fuel = d.fuel_surcharge_terms ?? {};
  const detention = d.detention_terms ?? {};
  const accessorials: Array<{ type: string; max_amount?: number | string | null }> = d.accessorials_allowed ?? [];

  return (
    <div>
      <Field label="Load #" value={d.load_number} />
      <Field label="Carrier" value={d.carrier_name} />
      <Field label="Lane" value={d.origin && d.destination ? `${d.origin} → ${d.destination}` : d.origin ?? d.destination} />
      <Field label="Equipment" value={d.equipment_type} />
      <Field label="Pickup" value={formatDate(d.pickup_date)} />
      <Field label="Delivery" value={formatDate(d.delivery_date)} />
      <Field label="Linehaul rate" value={formatCurrency(d.linehaul_rate)} />
      <Field
        label="Fuel surcharge"
        value={
          fuel.type === "all_in"
            ? "All-in (no separate FSC)"
            : fuel.type
            ? `${fuel.type.replace(/_/g, " ")}${fuel.value != null ? ` — ${fuel.value}` : ""}`
            : undefined
        }
      />
      <Field
        label="Detention terms"
        value={
          detention.free_time_hours != null || detention.rate_per_hour != null
            ? `${detention.free_time_hours ?? "?"}h free, then ${formatCurrency(detention.rate_per_hour)}/h`
            : undefined
        }
      />
      <div className="py-1.5 text-sm">
        <span className="text-gray-500">Accessorials allowed</span>
        {accessorials.length > 0 ? (
          <ul className="mt-1 space-y-0.5">
            {accessorials.map((a, i) => (
              <li key={i} className="flex justify-between text-gray-900">
                <span className="font-medium">{a.type}</span>
                <span className="text-gray-500">{a.max_amount != null ? `up to ${formatCurrency(a.max_amount)}` : "no cap"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-gray-400">None specified</p>
        )}
      </div>
      <ExtractionFooter document={document} />
    </div>
  );
}

function InvoiceBody({ document }: { document: DocumentOut }) {
  const d = document.extracted_data ?? {};
  const lineItems: Array<{ line_type: string; description?: string | null; amount: number | string }> = d.line_items ?? [];

  return (
    <div>
      <Field label="Invoice #" value={d.invoice_number} />
      <Field label="Load #" value={d.load_number} />
      <Field label="Carrier" value={d.carrier_name} />
      <div className="py-1.5 text-sm">
        <span className="text-gray-500">Billed line items</span>
        {lineItems.length > 0 ? (
          <ul className="mt-1 space-y-1">
            {lineItems.map((li, i) => (
              <li key={i} className="flex justify-between text-gray-900">
                <span className="capitalize">{li.line_type.replace(/_/g, " ")}{li.description ? ` — ${li.description}` : ""}</span>
                <span className="font-medium tabular-nums">{formatCurrency(li.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-gray-400">No line items extracted</p>
        )}
      </div>
      <div className="mt-1 border-t border-gray-100 pt-2">
        <Field label="Total billed" value={formatCurrency(d.total_amount)} />
      </div>
      <ExtractionFooter document={document} />
    </div>
  );
}

function PodBody({ document }: { document: DocumentOut }) {
  const d = document.extracted_data ?? {};
  return (
    <div>
      <Field label="Delivery confirmed" value={d.delivery_confirmed ? "Yes" : "No"} />
      <Field label="Signed" value={d.signed ? "Yes" : "No"} />
      <Field label="Arrival" value={formatDateTime(d.arrival_time ?? d.check_in_time)} />
      <Field label="Departure" value={formatDateTime(d.departure_time ?? d.check_out_time)} />
      {d.notes && (
        <div className="py-1.5 text-sm">
          <span className="text-gray-500">Notes</span>
          <p className="mt-1 text-gray-900">{d.notes}</p>
        </div>
      )}
      <ExtractionFooter document={document} />
    </div>
  );
}

const BODIES: Record<DocumentType, (props: { document: DocumentOut }) => React.ReactNode> = {
  rate_confirmation: RateConfirmationBody,
  invoice: InvoiceBody,
  pod: PodBody,
};

function PreviewLink({ document }: { document: DocumentOut }) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsOpening(true);
    try {
      await openDocumentPreview(document.id);
    } catch (err) {
      setError(previewErrorMessage(err));
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={isOpening}
        className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-wait disabled:opacity-60"
      >
        {isOpening ? (
          "Opening…"
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path
                d="M1.5 8s2.5-5 6.5-5 6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Preview
          </>
        )}
      </button>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}

/** One column of the RC / Invoice / POD side-by-side comparison. Renders an empty state when that document type hasn't been uploaded yet. */
export function DocumentPanel({ docType, document }: { docType: DocumentType; document: DocumentOut | undefined }) {
  const Body = BODIES[docType];

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{PANEL_LABELS[docType]}</h3>
          {document && (
            <span className="block truncate text-xs text-gray-400" title={document.original_filename}>
              {document.original_filename}
            </span>
          )}
        </div>
        {document && <PreviewLink document={document} />}
      </div>
      <div className="flex-1 px-4 py-3">
        {document ? (
          <Body document={document} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 py-10 text-center">
            <p className="text-sm font-medium text-gray-400">Not uploaded yet</p>
            <p className="text-xs text-gray-400">No {PANEL_LABELS[docType].toLowerCase()} on file for this load.</p>
          </div>
        )}
      </div>
    </div>
  );
}
