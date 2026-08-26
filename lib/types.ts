/**
 * TypeScript types mirroring the backend's broker-portal Pydantic schemas
 * (recon-backend/app/schemas/broker.py, plus the shared document/line-item
 * shapes from app/schemas/documents.py and app/schemas/loads.py). Kept as
 * one file since the repos aren't wired together with codegen — if the
 * backend schemas change, this is the file to update alongside them.
 */

export interface CarrierUser {
  id: string;
  carrier_id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

export type LoadStage = "active" | "matched" | "closed";

/** The computed, reviewer-facing rollup of a load's line items — same vocabulary the admin app uses. */
export type MatchStatusValue = "clean" | "discrepancy" | "needs_info" | "no_data";

export interface BrokerLoadListItem {
  id: string;
  load_number: string;
  status: LoadStage;
  match_status: MatchStatusValue;
  linehaul_rate: number | string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  created_at: string;
}

export type DocumentType = "rate_confirmation" | "invoice" | "pod";
export type DocumentSource = "email" | "upload";
export type DocumentStatus = "received" | "processing" | "processed" | "failed";

export interface DocumentOut {
  id: string;
  load_id: string | null;
  doc_type: DocumentType;
  source: DocumentSource;
  status: DocumentStatus;
  original_filename: string;
  content_type: string | null;
  extracted_data: Record<string, any>;
  extraction_confidence: number | string | null;
  received_at: string;
  processed_at: string | null;
}

export type LineItemType = "linehaul" | "fuel_surcharge" | "detention" | "accessorial" | "other";
export type LineItemDecision = "clean" | "discrepancy" | "needs_info";

export interface LineItemOut {
  id: string;
  line_type: LineItemType;
  description: string | null;
  billed_amount: number | string;
  expected_amount: number | string | null;
  variance_amount: number | string | null;
  match_status: LineItemDecision;
  match_reason: string | null;
}

/** Mirrors the dict shape returned by app.ai.matching.match_invoice on the backend. */
export interface MatchResult {
  status: MatchStatusValue;
  summary: string;
  total_rate_con: number | string | null;
  total_invoiced: number | string | null;
  variance: number | string | null;
  confidence: number;
  recommended_action: string;
}

export interface BrokerLoadDetail extends BrokerLoadListItem {
  origin: string | null;
  destination: string | null;
  equipment_type: string | null;
  documents: DocumentOut[];
  line_items: LineItemOut[];
  match_result: MatchResult | null;
}

export interface DocumentUploadResponse {
  document: DocumentOut;
  load_id: string | null;
  message: string;
}

export type AuditActorType = "system" | "user" | "carrier";

/** One row of a load's audit timeline, filtered server-side to exclude internal reviewer notes — see app.services.audit_service.list_audit_log_for_load_broker_view. */
export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  actor_type: AuditActorType;
  actor_name: string | null;
  details: Record<string, any>;
  created_at: string;
}
