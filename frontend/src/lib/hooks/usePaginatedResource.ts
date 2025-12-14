"use client";

import { useCallback, useState } from "react";
import type { PaginatedResponse } from "@/lib/types";
import { useAsyncEffect } from "@/lib/hooks/useAsyncEffect";

export type PaginationParams = { page: number; per_page: number };

export type PaginatedFetcher<T> = (
  params: PaginationParams,
  ctx: { signal: AbortSignal },
) => Promise<PaginatedResponse<T>>;

export function usePaginatedResource<T>(options: {
  enabled: boolean;
  fetcher: PaginatedFetcher<T>;
  initialPage?: number;
  perPage?: number;
  deps?: React.DependencyList;
}) {
  const [page, setPage] = useState(options.initialPage ?? 1);
  const [perPage, setPerPage] = useState(options.perPage ?? 10);
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(options.enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const mutate = useCallback(
    (updater: (prev: PaginatedResponse<T> | null) => PaginatedResponse<T> | null) => {
      setData((prev) => updater(prev));
    },
    [],
  );

  useAsyncEffect(
    async ({ signal, isActive }) => {
      if (!options.enabled) {
        setLoading(false);
        setError(null);
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await options.fetcher({ page, per_page: perPage }, { signal });
        if (!isActive()) return;
        setData(res);
      } catch (e: unknown) {
        if (!isActive()) return;
        setError((e as Error)?.message ?? "Failed to load data");
        setData(null);
      } finally {
        if (!isActive()) return;
        setLoading(false);
      }
    },
    [options.enabled, options.fetcher, page, perPage, refreshKey, ...(options.deps ?? [])],
  );

  const currentPage = data?.meta.current_page ?? page;
  const lastPage = data?.meta.last_page ?? currentPage;
  const total = data?.meta.total ?? 0;

  return {
    data,
    loading,
    error,
    page,
    perPage,
    setPage,
    setPerPage,
    refresh,
    mutate,
    currentPage,
    lastPage,
    total,
  };
}

