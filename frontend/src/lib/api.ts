import { PaginatedResponse } from "./types";

export class APIError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set");
}

type RequestOptions = RequestInit & {
  token?: string | null;
  isFormData?: boolean;
};

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== "object") return false;
  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (!Array.isArray(entry)) return false;
    if (!entry.every((item) => typeof item === "string")) return false;
  }
  return true;
}

export async function apiRequest<T>(
  endpoint: string,
  { token, isFormData, headers, ...init }: RequestOptions = {},
): Promise<T> {
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  const url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;

  const resolvedHeaders: HeadersInit = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers ?? {}),
  };

  if (token) {
    (resolvedHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers: resolvedHeaders,
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const looksLikeJson = (() => {
    const trimmed = text.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("[");
  })();

  let json: unknown = null;
  if (text && (/\bapplication\/json\b/i.test(contentType) || /\+json\b/i.test(contentType) || looksLikeJson)) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const jsonRecord =
      json && typeof json === "object" ? (json as Record<string, unknown>) : null;
    const jsonMessage = typeof jsonRecord?.message === "string" ? jsonRecord.message : null;
    const jsonErrors = isStringArrayRecord(jsonRecord?.errors) ? jsonRecord.errors : undefined;
    const fallbackMessage =
      (text && !json ? "Request failed (non-JSON response)" : null) ?? response.statusText ?? "Request failed";
    throw new APIError(
      response.status,
      jsonMessage ?? fallbackMessage,
      jsonErrors,
    );
  }

  return json as T;
}

export async function apiPaginated<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<PaginatedResponse<T>> {
  return apiRequest<PaginatedResponse<T>>(endpoint, options);
}

export function getErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (error instanceof APIError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
