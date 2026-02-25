import { ProjectFilter } from "@/components/ProjectFilter";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SpansDataTable } from "@/components/SpansDataTable";
import { SpansCharts } from "@/components/SpansCharts";
import { ColumnVisibilityToggle } from "@/components/ColumnVisibilityToggle";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { TableIcon, ChartBarIcon } from "lucide-react";
import { useSpansTable } from "@/hooks/useSpansTable";
import { useHomeFilters } from "@/hooks/useHomeFilters";
import { useSpansData } from "@/hooks/useSpansData";

export function Home() {
  const { viewMode, handleViewModeChange } = useHomeFilters();
  const { spansData, isLoading } = useSpansData();
  const { table, expanded, setExpanded } = useSpansTable(spansData);

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
              onClick={() => handleViewModeChange("table")}
              aria-label="Table view"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "charts" ? "default" : "outline"}
              size="icon"
              onClick={() => handleViewModeChange("charts")}
              aria-label="Charts view"
            >
              <ChartBarIcon className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>

      </div>

      {/* Table or Charts */}
      {viewMode === "table" ? (
        <SpansDataTable
          table={table}
          expanded={expanded}
          setExpanded={setExpanded}
          isLoading={isLoading}
        />
      ) : (
        <SpansCharts data={spansData} isLoading={isLoading} />
      )}
    </div>
  );
}

