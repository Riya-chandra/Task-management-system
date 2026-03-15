import useSWR from 'swr';
import { tasksApi } from '@/lib/api';
import { TaskFilters } from '@/types';

export function useTasks(filters: Partial<TaskFilters>) {

  const key = filters
    ? ['tasks', filters.page, filters.limit, filters.status, filters.search]
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => tasksApi.getAll(filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,       // Avoid flash on page change
    }
  );

  return {
    tasks: data?.items ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}
