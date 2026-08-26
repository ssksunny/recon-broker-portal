import { api, ApiError } from "./api";

/**
 * Opens a document's original file in a new tab. A plain `<a href={apiUrl}>`
 * won't work here — auth is a Bearer token in localStorage, and a normal
 * browser navigation can't attach it — so this fetches the file with the
 * token attached, then hands the browser a same-origin blob: URL to open
 * instead. The object URL is revoked after a minute, which is long enough
 * for the new tab to have loaded it.
 */
export async function openDocumentPreview(documentId: string): Promise<void> {
  const blob = await api.fetchDocumentFile(documentId);
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    // Popup blocked — fall back to a same-tab navigation rather than
    // silently doing nothing.
    window.location.assign(url);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function previewErrorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Couldn't load the document. Try again.";
}
