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
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

export interface HierarchicalSpanData extends SpanData {
  isTrace: boolean;
  children?: HierarchicalSpanData[];
  level?: number;
  aggregatedTokens?: number;
  aggregatedCost?: number;
}

export const columns: ColumnDef<HierarchicalSpanData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("name")}</div>
    ),
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
  {
    accessorKey: "attributes.openinference.span.kind",
    header: "Kind",
    cell: ({ row }) => {
      const kind = row.original["attributes.openinference.span.kind"];
      const isTrace = row.original.isTrace;

      if (!kind) {
        return <div>-</div>;
      }

      return (
        <Badge variant={isTrace ? "default" : "secondary"}>
          {kind}
        </Badge>
      );
    },
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
      const data = row.original;
      // For traces, use aggregated value; for spans, use the actual value
      const tokens = data.isTrace
        ? data.aggregatedTokens
        : data["attributes.llm.token_count.total"];

      // For trace rows with children, show hover card with breakdown
      if (data.isTrace && data.children && data.children.length > 0) {
        // Group children by name and calculate tokens per name
        const breakdown = data.children.reduce((acc, child) => {
          const childName = child.name;
          const childTokens = child["attributes.llm.token_count.total"] || 0;
          if (!acc[childName]) {
            acc[childName] = 0;
          }
          acc[childName] += childTokens;
          return acc;
        }, {} as Record<string, number>);

        return (
          <HoverCard>
            <HoverCardTrigger>
              <div className="cursor-pointer hover:underline">
                {(tokens ?? 0).toLocaleString()}
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <div className="font-semibold text-sm">Token Breakdown by Child</div>
                <div className="space-y-1">
                  {Object.entries(breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([name, value]) => (
                      <div key={name} className="flex justify-between items-center text-xs">
                        <span className="truncate max-w-[180px]" title={name}>
                          {name}
                        </span>
                        <span className="font-medium ml-2">
                          {value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="pt-2 border-t text-xs font-medium">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{tokens?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      }

      // For trace rows, show 0 instead of -; for span rows, show - if no value
      if (data.isTrace) {
        return (tokens ?? 0).toLocaleString();
      }
      return tokens ? tokens.toLocaleString() : "-";
    },
  },
  {
    accessorKey: "attributes.llm.cost.total",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => {
      const data = row.original;
      // For traces, use aggregated value; for spans, use the actual value
      const cost = data.isTrace
        ? data.aggregatedCost
        : data["attributes.llm.cost.total"];

      // For trace rows with children, show hover card with breakdown
      if (data.isTrace && data.children && data.children.length > 0) {
        // Group children by name and calculate cost per name
        const breakdown = data.children.reduce((acc, child) => {
          const childName = child.name;
          const childCost = child["attributes.llm.cost.total"] || 0;
          if (!acc[childName]) {
            acc[childName] = 0;
          }
          acc[childName] += childCost;
          return acc;
        }, {} as Record<string, number>);

        return (
          <div className="text-right">
            <HoverCard>
              <HoverCardTrigger>
                <div className="cursor-pointer hover:underline font-medium inline-block">
                  ${(cost ?? 0).toFixed(4)}
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <div className="font-semibold text-sm">Cost Breakdown by Child</div>
                  <div className="space-y-1">
                    {Object.entries(breakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([name, value]) => (
                        <div key={name} className="flex justify-between items-center text-xs">
                          <span className="truncate max-w-[180px]" title={name}>
                            {name}
                          </span>
                          <span className="font-medium ml-2">
                            ${value.toFixed(4)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="pt-2 border-t text-xs font-medium">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>${cost?.toFixed(4) || "0.0000"}</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      }

      // For trace rows, show 0 instead of -; for span rows, show - if no value
      if (data.isTrace) {
        return (
          <div className="text-right font-medium">
            ${(cost ?? 0).toFixed(4)}
          </div>
        );
      }
      return (
        <div className="text-right font-medium">
          {cost ? `$${cost.toFixed(4)}` : "-"}
        </div>
      );
    },
  },
];

/**
 * Recursively builds children for a span and calculates aggregated values
 */
function buildChildrenTree(
  spanId: string,
  allSpans: SpanData[],
  level: number
): HierarchicalSpanData {
  const span = allSpans.find((s) => s["context.span_id"] === spanId);
  if (!span) {
    throw new Error(`Span not found: ${spanId}`);
  }

  const isTrace = !span.parent_id;
  const children: HierarchicalSpanData[] = [];

  // Find all direct children of this span
  const directChildren = allSpans.filter((s) => s.parent_id === spanId);

  // Recursively build children trees
  directChildren.forEach((child) => {
    const childTree = buildChildrenTree(child["context.span_id"], allSpans, level + 1);
    children.push(childTree);
  });

  // Calculate aggregated values from all descendants (recursive)
  let totalTokens = 0;
  let totalCost = 0;

  const calculateAggregates = (node: HierarchicalSpanData) => {
    // Add direct value if it exists
    const nodeTokens = node["attributes.llm.token_count.total"];
    const nodeCost = node["attributes.llm.cost.total"];

    if (nodeTokens !== null && nodeTokens !== undefined) {
      totalTokens += nodeTokens;
    }
    if (nodeCost !== null && nodeCost !== undefined) {
      totalCost += nodeCost;
    }

    // Recursively add children's values
    if (node.children) {
      node.children.forEach(calculateAggregates);
    }
  };

  // Calculate aggregates from all children
  children.forEach((child) => calculateAggregates(child));

  return {
    ...span,
    isTrace,
    level,
    children: children.length > 0 ? children : undefined,
    aggregatedTokens: totalTokens,
    aggregatedCost: totalCost,
  };
}

/**
 * Transforms flat span data into hierarchical structure
 * Traces (parent_id === null) are top-level, spans can be nested at any level
 */
export function transformToHierarchical(data: SpanData[]): HierarchicalSpanData[] {
  // Find all traces (top-level spans with parent_id === null)
  const traces = data.filter((span) => !span.parent_id);

  // Build tree for each trace
  return traces.map((trace) => buildChildrenTree(trace["context.span_id"], data, 0));
}

export function useSpansTable(data: SpanData[]) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100,
  });

  // Transform data to hierarchical structure
  const hierarchicalData = React.useMemo(() => {
    return transformToHierarchical(data);
  }, [data]);

  // Flatten hierarchical data for table display
  const flattenedData = React.useMemo(() => {
    const result: HierarchicalSpanData[] = [];

    // Recursively flatten hierarchical data for table display
    const flattenNode = (
      node: HierarchicalSpanData,
      result: HierarchicalSpanData[]
    ): void => {
      result.push(node);

      // If this node is expanded and has children, recursively add them
      if (expanded[node["context.span_id"]] && node.children) {
        node.children.forEach((child) => {
          flattenNode(child, result);
        });
      }
    };

    hierarchicalData.forEach((trace) => {
      flattenNode(trace, result);
    });

    return result;
  }, [hierarchicalData, expanded]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: flattenedData,
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

  return { table, expanded, setExpanded };
}

