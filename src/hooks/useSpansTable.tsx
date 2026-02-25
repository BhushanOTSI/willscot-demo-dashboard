import * as React from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type SpanData } from "@/hooks/useSpansExport";
import { format } from "date-fns";

export const columns: ColumnDef<SpanData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("start_time"));
      return format(date, "MMM dd, yyyy HH:mm:ss");
    },
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("end_time"));
      return format(date, "MMM dd, yyyy HH:mm:ss");
    },
  },
  {
    accessorKey: "attributes.llm.model_name",
    header: "Model",
    cell: ({ row }) => {
      const model = row.original["attributes.llm.model_name"];
      return <div className="max-w-[150px] truncate">{model || "-"}</div>;
    },
  },
  {
    accessorKey: "attributes.llm.token_count.total",
    header: "Total Tokens",
    cell: ({ row }) => {
      const tokens = row.original["attributes.llm.token_count.total"];
      return tokens ? tokens.toLocaleString() : "-";
    },
  },
  {
    accessorKey: "attributes.llm.cost.total",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => {
      const cost = row.original["attributes.llm.cost.total"];
      return (
        <div className="text-right font-medium">
          {cost ? `$${cost.toFixed(4)}` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "attributes.openinference.span.kind",
    header: "Kind",
    cell: ({ row }) => {
      const kind = row.original["attributes.openinference.span.kind"];
      return <div className="capitalize">{kind || "-"}</div>;
    },
  },
  {
    accessorKey: "context.trace_id",
    header: "Trace ID",
    cell: ({ row }) => {
      const traceId = row.original["context.trace_id"];
      return (
        <div className="max-w-[150px] truncate font-mono text-xs">
          {traceId || "-"}
        </div>
      );
    },
  },
];

export function useSpansTable(data: SpanData[]) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10000, // Show all records (set to a very large number)
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  });

  return table;
}

