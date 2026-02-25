import * as React from "react";
import { ProjectFilter } from "@/components/ProjectFilter";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SpansDataTable } from "@/components/SpansDataTable";
import { SpansCharts } from "@/components/SpansCharts";
import { ColumnVisibilityToggle } from "@/components/ColumnVisibilityToggle";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { TableIcon, ChartBarIcon } from "lucide-react";
import { useSpansExport } from "@/hooks/useSpansExport";
import { useSpansTable } from "@/hooks/useSpansTable";
import { useStore } from "@/stores/useStore";

type ViewMode = "table" | "charts";

export function Home() {
  const { selectedProject, dateRange } = useStore();
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");

  const startTime = dateRange?.from
    ? dateRange.from.toISOString()
    : undefined;
  const endTime = dateRange?.to ? dateRange.to.toISOString() : undefined;

  const { data, isLoading } = useSpansExport(
    {
      projectName: selectedProject?.name,
      startTime,
      endTime,
    },
    {
      enabled: !!selectedProject?.name && !!startTime && !!endTime,
    }
  );

  const spansData = data?.data || [];
  const table = useSpansTable(spansData);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <ProjectFilter />
        <DateRangePicker />
        {viewMode === "table" && <ColumnVisibilityToggle table={table} />}
        <div className="flex-1 flex justify-end">
          <ButtonGroup >
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "charts" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("charts")}
              aria-label="Charts view"
            >
              <ChartBarIcon className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>

      </div>

      {/* Table or Charts */}
      {viewMode === "table" ? (
        <SpansDataTable table={table} isLoading={isLoading} />
      ) : (
        <SpansCharts data={spansData} isLoading={isLoading} />
      )}
    </div>
  );
}

