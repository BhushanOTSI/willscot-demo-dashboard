import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type SpanData } from "@/hooks/useSpansExport";
import { format } from "date-fns";

interface SpansChartsProps {
    data: SpanData[];
    isLoading?: boolean;
}

export function SpansCharts({ data, isLoading }: SpansChartsProps) {
    // Process data for charts (hooks must be called before early returns)
    const costOverTime = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const grouped = data.reduce((acc, span) => {
            const date = format(new Date(span.start_time), "MMM dd");
            const cost = span["attributes.llm.cost.total"] || 0;
            if (!acc[date]) {
                acc[date] = { date, cost: 0, count: 0 };
            }
            acc[date].cost += cost;
            acc[date].count += 1;
            return acc;
        }, {} as Record<string, { date: string; cost: number; count: number }>);
        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    const tokenUsage = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const grouped = data.reduce((acc, span) => {
            const date = format(new Date(span.start_time), "MMM dd");
            const tokens = span["attributes.llm.token_count.total"] || 0;
            if (!acc[date]) {
                acc[date] = { date, tokens: 0, count: 0 };
            }
            acc[date].tokens += tokens;
            acc[date].count += 1;
            return acc;
        }, {} as Record<string, { date: string; tokens: number; count: number }>);
        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }, [data]);

    const modelDistribution = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const grouped = data.reduce((acc, span) => {
            const model = span["attributes.llm.model_name"] || "Unknown";
            if (!acc[model]) {
                acc[model] = { model, count: 0, cost: 0 };
            }
            acc[model].count += 1;
            acc[model].cost += span["attributes.llm.cost.total"] || 0;
            return acc;
        }, {} as Record<string, { model: string; count: number; cost: number }>);
        return Object.values(grouped)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((item, index) => ({
                ...item,
                fill: `var(--chart-${(index % 5) + 1})`,
            }));
    }, [data]);

    const spanKindDistribution = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const grouped = data.reduce((acc, span) => {
            const kind = span["attributes.openinference.span.kind"] || "Unknown";
            if (!acc[kind]) {
                acc[kind] = { kind, count: 0 };
            }
            acc[kind].count += 1;
            return acc;
        }, {} as Record<string, { kind: string; count: number }>);
        return Object.values(grouped).sort((a, b) => b.count - a.count);
    }, [data]);

    const totalCost = React.useMemo(() =>
        (data || []).reduce((sum, span) => sum + (span["attributes.llm.cost.total"] || 0), 0),
        [data]
    );
    const totalTokens = React.useMemo(() =>
        (data || []).reduce((sum, span) => sum + (span["attributes.llm.token_count.total"] || 0), 0),
        [data]
    );
    const avgCostPerSpan = data && data.length > 0 ? totalCost / data.length : 0;
    const avgTokensPerSpan = data && data.length > 0 ? totalTokens / data.length : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading charts...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No data available for charts.</div>
            </div>
        );
    }

    const costConfig = {
        cost: {
            label: "Cost",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    const tokenConfig = {
        tokens: {
            label: "Tokens",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig;

    const modelConfig = modelDistribution.reduce((acc, item, index) => {
        const chartNum = (index % 5) + 1;
        acc[item.model] = {
            label: item.model.length > 20 ? item.model.substring(0, 20) + "..." : item.model,
            color: `var(--chart-${chartNum})`,
        };
        return acc;
    }, {} as ChartConfig);

    const kindConfig = spanKindDistribution.reduce((acc, item, index) => {
        const chartNum = (index % 5) + 1;
        acc[item.kind] = {
            label: item.kind,
            color: `var(--chart-${chartNum})`,
        };
        return acc;
    }, {} as ChartConfig);

    const COLORS = [
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4)",
        "var(--chart-5)",
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Cost</CardDescription>
                        <CardTitle className="text-2xl">${totalCost.toFixed(4)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Tokens</CardDescription>
                        <CardTitle className="text-2xl">{totalTokens.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg Cost/Span</CardDescription>
                        <CardTitle className="text-2xl">${avgCostPerSpan.toFixed(4)}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg Tokens/Span</CardDescription>
                        <CardTitle className="text-2xl">{Math.round(avgTokensPerSpan).toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Cost Over Time & Token Usage Over Time - Side by Side */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Cost Over Time</CardTitle>
                        <CardDescription>Total cost per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={costConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={costOverTime}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Token Usage Over Time</CardTitle>
                        <CardDescription>Total tokens per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={tokenConfig} className="min-h-[200px] w-full">
                            <LineChart accessibilityLayer data={tokenUsage}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                    type="monotone"
                                    dataKey="tokens"
                                    stroke="var(--color-tokens)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Model Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Model Distribution</CardTitle>
                        <CardDescription>Usage by model</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={modelConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={modelDistribution} layout="vertical">
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis
                                    dataKey="model"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    width={120}
                                    tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + "..." : value}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="count"
                                    fill="var(--chart-1)"
                                    radius={4}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Span Kind Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Span Kind Distribution</CardTitle>
                        <CardDescription>Distribution by span kind</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={kindConfig} className="min-h-[300px] w-full">
                            <PieChart>
                                <Pie
                                    data={spanKindDistribution}
                                    dataKey="count"
                                    nameKey="kind"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ kind, count }) => `${kind}: ${count}`}
                                >
                                    {spanKindDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

