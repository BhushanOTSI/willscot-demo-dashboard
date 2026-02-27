import { useSpansExport } from "@/hooks/useSpansExport";
import { useStore } from "@/stores/useStore";

export function useSpansData() {
  const { selectedProject, dateRange } = useStore();

  const startTime = dateRange?.from
    ? dateRange.from.toISOString()
    : undefined;
  const endTime = dateRange?.to ? dateRange.to.toISOString() : undefined;

  const { data, isLoading } = useSpansExport(
    {
      projectName: selectedProject?.name,
      startTime,
      endTime,
      limit: 100,
    },
    {
      enabled: !!selectedProject?.name && !!startTime && !!endTime,
    }
  );

  const spansData = data?.data || [];
  return {
    spansData,
    isLoading,
  };
}

