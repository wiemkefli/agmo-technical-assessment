import { getErrorMessage } from "@/lib/api";

export function getApiBaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? null;
}

export async function fetchApiBlob(path: string, token: string, options?: { signal?: AbortSignal }): Promise<Blob> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  if (!token) throw new Error("Missing auth token");

  const cleanPath = path.replace(/^\//, "");

  const res = await fetch(`${apiBaseUrl}/${cleanPath}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: options?.signal,
  });

  if (!res.ok) {
    throw new Error(`Fetch failed (${res.status})`);
  }

  return res.blob();
}

export function openBlobInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function getBlobErrorMessage(error: unknown, fallback: string): string {
  return getErrorMessage(error, fallback);
}

