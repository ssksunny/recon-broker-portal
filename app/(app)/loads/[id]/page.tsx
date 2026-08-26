"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { AuditLogEntry, BrokerLoadDetail, DocumentType } from "@/lib/types";
import { StatusBadge, StageBadge } from "@/components/StatusBadge";
import { ErrorBanner } from "@/components/ErrorBanner";
import { DecisionSummaryCard } from "@/components/DecisionSummaryCard";
import { DocumentPanel } from "@/components/DocumentPanel";
import { LineItemsTable } from "@/components/LineItemsTable";
import { RespondPanel } from "@/components/RespondPanel";
import { AuditTrail } from "@/components/AuditTrail";
import { formatCurrency, formatDate } from "@/lib/format";

const DOC_TYPES: DocumentType[] = ["rate_confirmation", "invoice", "pod"];

/** The most recently processed document of a given type — if a corrected one was re-uploaded, the newer one wins. */
function latestByType(documents: BrokerLoadDetail["documents"], docType: DocumentType) {
  return [...documents].reverse().find((d) => d.doc_type === docType && d.status === "processed");
}

/**
 * A broker's view of one load: status and Recon's reasoning up top, their
 * own source documents side-by-side, the line-by-line comparison, and the
 * ability to respond to a flag or upload a corrected/missing document —
 * exactly the three things the broker portal was scoped to provide, no
 * internal reviewer notes.
 */
export default function LoadDetailPage() {
  const params = useParams<{ id: string }>();
  const loadId = params.id;

  const [detail, setDetail] = useState<BrokerLoadDetail | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    let cancelled = false;
    Promise.all([api.getLoad(loadId), api.getAuditTrail(loadId)])
      .then(([loadData, auditData]) => {
        if (!cancelled) {
          setDetail(loadData);
          setAuditTrail(auditData);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load this shipment.");
      });
    return () => {
      cancelled = true;
    };
  }, [loadId]);

  useEffect(() => fetchAll(), [fetchAll]);

  if (error) {
    return (
      <div>
        <Link href="/loads" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900">
          ← My Loads
        </Link>
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 h-28 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const route =
    detail.origin && detail.destination
      ? `${detail.origin} → ${detail.destination}`
      : detail.origin ?? detail.destination ?? null;

  return (
    <div>
      <Link href="/loads" className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900">
        ← My Loads
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Load {detail.load_number}</h1>
            <StageBadge stage={detail.status} />
            <StatusBadge status={detail.match_status} className="text-sm" />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {route}
            {detail.equipment_type ? `${route ? " · " : ""}${detail.equipment_type}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Pickup {formatDate(detail.pickup_date)} · Delivery {formatDate(detail.delivery_date)}
            {detail.linehaul_rate != null ? ` · Linehaul ${formatCurrency(detail.linehaul_rate)}` : ""}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <DecisionSummaryCard matchStatus={detail.match_status} matchResult={detail.match_result} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {DOC_TYPES.map((docType) => (
          <DocumentPanel key={docType} docType={docType} document={latestByType(detail.documents, docType)} />
        ))}
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Line items</h2>
        <LineItemsTable lineItems={detail.line_items} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RespondPanel loadId={detail.id} onSuccess={fetchAll} />
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Activity</h2>
          <AuditTrail entries={auditTrail ?? []} />
        </div>
      </div>
    </div>
  );
}
