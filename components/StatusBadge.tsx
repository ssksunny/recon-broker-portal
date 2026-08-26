import clsx from "clsx";
import type { LoadStage, MatchStatusValue } from "@/lib/types";

const MATCH_STYLES: Record<MatchStatusValue, string> = {
  clean: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  discrepancy: "bg-rose-50 text-rose-700 ring-rose-600/20",
  needs_info: "bg-amber-50 text-amber-700 ring-amber-600/20",
  no_data: "bg-gray-100 text-gray-500 ring-gray-500/20",
};

const MATCH_LABELS: Record<MatchStatusValue, string> = {
  clean: "Clean",
  discrepancy: "Discrepancy",
  needs_info: "Needs Info",
  no_data: "No Data",
};

/** The reviewer-facing rollup: clean / discrepancy / needs_info / no_data. Used everywhere a load or line item's audit outcome is shown. */
export function StatusBadge({ status, className }: { status: MatchStatusValue | string; className?: string }) {
  const key = (status in MATCH_STYLES ? status : "no_data") as MatchStatusValue;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        MATCH_STYLES[key],
        className
      )}
    >
      {MATCH_LABELS[key] ?? status}
    </span>
  );
}

const STAGE_STYLES: Record<LoadStage, string> = {
  active: "bg-blue-50 text-blue-700 ring-blue-600/20",
  matched: "bg-violet-50 text-violet-700 ring-violet-600/20",
  closed: "bg-gray-100 text-gray-500 ring-gray-500/20",
};

const STAGE_LABELS: Record<LoadStage, string> = {
  active: "Active",
  matched: "Matched",
  closed: "Closed",
};

/** The load's lifecycle stage: active / matched / closed. A different axis from StatusBadge — a closed load can still have been a discrepancy. */
export function StageBadge({ stage, className }: { stage: LoadStage; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STAGE_STYLES[stage],
        className
      )}
    >
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}
