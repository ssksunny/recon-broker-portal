"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { BrokerLoadListItem } from "@/lib/types";
import { LoadsTable } from "@/components/LoadsTable";
import { PageHeader } from "@/components/PageHeader";
import { ErrorBanner } from "@/components/ErrorBanner";
import { TableSkeleton } from "@/components/TableSkeleton";

/**
 * The broker's home screen: every load an admin has assigned to their
 * carrier, whatever its status — clean, discrepancy, needs info, or still
 * being matched. Unlike the admin app's Exception Queue, this isn't
 * filtered down to just flagged loads; a broker with only a handful of
 * loads wants to see all of them, not just the ones with a problem.
 */
export default function LoadsPage() {
  const [loads, setLoads] = useState<BrokerLoadListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listLoads()
      .then((data) => {
        if (!cancelled) setLoads(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load your loads.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const description =
    loads === null
      ? "Loading…"
      : loads.length === 0
      ? "Nothing assigned to you yet."
      : `${loads.length} load${loads.length === 1 ? "" : "s"} on file.`;

  return (
    <div>
      <PageHeader title="My Loads" description={description} />
      {error && <ErrorBanner message={error} />}
      {loads === null && !error ? <TableSkeleton /> : <LoadsTable loads={loads ?? []} />}
    </div>
  );
}
