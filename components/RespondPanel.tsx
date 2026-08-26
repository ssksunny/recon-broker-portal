"use client";

import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";

/**
 * The load detail page's action panel: reply to a Needs Info / discrepancy
 * flag with a message, and/or upload a corrected invoice or a missing POD.
 * Both actions are scoped server-side to this load and this broker's
 * carrier (see app/api/broker.py) — there's nothing here to configure that
 * could reach another load.
 */
export function RespondPanel({ loadId, onSuccess }: { loadId: string; onSuccess: () => void }) {
  const [message, setMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  const [docType, setDocType] = useState<"invoice" | "pod">("pod");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setMessageError(null);
    setIsSendingMessage(true);
    try {
      await api.respondToLoad(loadId, message.trim());
      setMessage("");
      setMessageSent(true);
      onSuccess();
    } catch (err) {
      setMessageError(err instanceof ApiError ? err.message : "Couldn't send your response. Try again.");
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      await api.uploadDocument({ loadId, docType, file });
      setUploadedName(file.name);
      setFile(null);
      onSuccess();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Couldn't upload that file. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-card">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Respond</h3>
      </div>

      <form onSubmit={handleSendMessage} className="border-b border-gray-100 px-4 py-4">
        <label htmlFor="respond-message" className="mb-1.5 block text-sm font-medium text-gray-700">
          Send a message
        </label>
        <textarea
          id="respond-message"
          rows={3}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setMessageSent(false);
          }}
          placeholder="e.g. Detention was pre-approved by dispatch — see attached email."
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        {messageError && <p className="mt-1.5 text-xs text-rose-600">{messageError}</p>}
        {messageSent && !messageError && <p className="mt-1.5 text-xs text-emerald-600">Sent.</p>}
        <button
          type="submit"
          disabled={isSendingMessage || !message.trim()}
          className="mt-2 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSendingMessage ? "Sending…" : "Send"}
        </button>
      </form>

      <form onSubmit={handleUpload} className="px-4 py-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload a document</label>
        <div className="flex flex-col gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as "invoice" | "pod")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="pod">Proof of Delivery</option>
            <option value="invoice">Corrected Invoice</option>
          </select>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>
        {uploadError && <p className="mt-1.5 text-xs text-rose-600">{uploadError}</p>}
        {uploadedName && !uploadError && (
          <p className="mt-1.5 text-xs text-emerald-600">Uploaded {uploadedName} — queued for review.</p>
        )}
        <button
          type="submit"
          disabled={isUploading || !file}
          className="mt-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading…" : "Upload"}
        </button>
      </form>
    </div>
  );
}
