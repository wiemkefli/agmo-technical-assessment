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

export async function apiRequest<T>(
  endpoint: string,
  { token, isFormData, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;

  const resolvedHeaders: HeadersInit = {
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
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new APIError(
      response.status,
      json?.message ?? "Request failed",
      json?.errors,
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
