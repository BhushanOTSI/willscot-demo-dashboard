import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { type Table as TableType } from "@tanstack/react-table";
import { type HierarchicalSpanData, columns } from "@/hooks/useSpansTable";
import { ChevronRight, ChevronDown } from "lucide-react";
import * as React from "react";

interface SpansDataTableProps {
  table: TableType<HierarchicalSpanData>;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isLoading?: boolean;
}

export function SpansDataTable({
  table,
  expanded,
  setExpanded,
  isLoading
}: SpansDataTableProps) {
  const handleToggleExpand = React.useCallback((spanId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [spanId]: !prev[spanId],
    }));
  }, [setExpanded]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows.map((row) => {
                const data = row.original;
                const isTrace = data.isTrace;
                const hasChildren = data.children && data.children.length > 0;
                const isExpanded = expanded[data["context.span_id"]] || false;
                const level = data.level || 0;

                // Determine background color based on trace state and expansion
                const getRowClassName = () => {
                  if (isTrace) {
                    // Darker background when expanded, lighter when collapsed
                    return isExpanded
                      ? "bg-primary/20 hover:bg-primary/30 font-bold"
                      : "bg-muted/30 font-medium";
                  }
                  if (level > 0) {
                    return "bg-muted/10";
                  }
                  return "";
                };

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={getRowClassName()}
                  >
                    {row.getVisibleCells().map((cell) => {
                      // Override the name cell to add expand/collapse button
                      if (cell.column.id === "name") {
                        return (
                          <TableCell key={cell.id}>
                            <div
                              className="flex items-center gap-2"
                              style={{ paddingLeft: `${level * 20}px` }}
                            >
                              {hasChildren && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleExpand(data["context.span_id"]);
                                  }}
                                  className="flex items-center justify-center w-4 h-4 hover:bg-muted rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                              {!hasChildren && <div className="w-4" />}
                              <div className="max-w-[200px] truncate">
                                {data.name}
                              </div>
                            </div>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

