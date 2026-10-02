"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export const searchQueryKeys = {
  search: (q: string) => ["search", q] as const,
};

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();
  const isSearchable = trimmed.length >= MIN_QUERY_LENGTH;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: searchQueryKeys.search(trimmed),
    queryFn: () => searchService.search(trimmed),
    enabled: isSearchable,
    staleTime: 30_000,
  });

  return {
    query,
    setQuery,
    debouncedQuery: trimmed,
    results: data,
    isLoading: isSearchable && (isLoading || isFetching),
    error,
    isSearchable,
    minQueryLength: MIN_QUERY_LENGTH,
  };
}
