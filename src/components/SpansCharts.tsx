import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Area, AreaChart } from "recharts";
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
        // Only consider rows with parent_id (exclude parent traces)
        const filteredData = data.filter(span => span.parent_id !== null);
        const grouped = filteredData.reduce((acc, span) => {
            const date = format(new Date(span.start_time), "MMM dd");
            const cost = span["attributes.llm.cost.total"] || 0;
            if (!acc[date]) {
                acc[date] = { date, cost: 0, count: 0, originalDate: new Date(span.start_time) };
            }
            acc[date].cost += cost;
            acc[date].count += 1;
            return acc;
        }, {} as Record<string, { date: string; cost: number; count: number; originalDate: Date }>);
        const sorted = Object.values(grouped).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

        // Ensure at least 7 days of data
        const result: { date: string; cost: number; count: number }[] = [];
        const dateMap = new Map(sorted.map(item => [item.date, item]));

        // Get the earliest and latest dates
        if (sorted.length > 0) {
            const earliestDate = sorted[0].originalDate;
            const latestDate = sorted[sorted.length - 1].originalDate;

            // Generate 7 days starting from the earliest date, or use last 7 days if we have more data
            const startDate = sorted.length >= 7
                ? new Date(latestDate.getTime() - 6 * 24 * 60 * 60 * 1000) // Last 7 days
                : earliestDate;

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + i);
                const dateStr = format(currentDate, "MMM dd");
                const existing = dateMap.get(dateStr);
                result.push({
                    date: dateStr,
                    cost: existing?.cost || 0,
                    count: existing?.count || 0,
                });
            }
        } else {
            // If no data, generate 7 days from today going backwards
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                result.push({
                    date: format(date, "MMM dd"),
                    cost: 0,
                    count: 0,
                });
            }
        }

        return result;
    }, [data]);

    const botMessageCostOverTime = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        // Only consider bot messages: spans with parent_id AND name contains "bot"
        const filteredData = data.filter(span =>
            span.parent_id !== null &&
            span.name?.toLowerCase().includes("bot")
        );
        const grouped = filteredData.reduce((acc, span) => {
            const date = format(new Date(span.start_time), "MMM dd");
            const cost = span["attributes.llm.cost.total"] || 0;
            if (!acc[date]) {
                acc[date] = { date, cost: 0, count: 0, originalDate: new Date(span.start_time) };
            }
            acc[date].cost += cost;
            acc[date].count += 1;
            return acc;
        }, {} as Record<string, { date: string; cost: number; count: number; originalDate: Date }>);
        const sorted = Object.values(grouped).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

        // Ensure at least 7 days of data
        const result: { date: string; cost: number; count: number }[] = [];
        const dateMap = new Map(sorted.map(item => [item.date, item]));

        // Get the earliest and latest dates
        if (sorted.length > 0) {
            const earliestDate = sorted[0].originalDate;
            const latestDate = sorted[sorted.length - 1].originalDate;

            // Generate 7 days starting from the earliest date, or use last 7 days if we have more data
            const startDate = sorted.length >= 7
                ? new Date(latestDate.getTime() - 6 * 24 * 60 * 60 * 1000) // Last 7 days
                : earliestDate;

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + i);
                const dateStr = format(currentDate, "MMM dd");
                const existing = dateMap.get(dateStr);
                result.push({
                    date: dateStr,
                    cost: existing?.cost || 0,
                    count: existing?.count || 0,
                });
            }
        } else {
            // If no data, generate 7 days from today going backwards
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                result.push({
                    date: format(date, "MMM dd"),
                    cost: 0,
                    count: 0,
                });
            }
        }

        return result;
    }, [data]);

    const userMessageCostOverTime = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        // Only consider user messages: spans with parent_id AND name does NOT contain "bot"
        const filteredData = data.filter(span =>
            span.parent_id !== null &&
            !span.name?.toLowerCase().includes("bot")
        );
        const grouped = filteredData.reduce((acc, span) => {
            const date = format(new Date(span.start_time), "MMM dd");
            const cost = span["attributes.llm.cost.total"] || 0;
            if (!acc[date]) {
                acc[date] = { date, cost: 0, count: 0, originalDate: new Date(span.start_time) };
            }
            acc[date].cost += cost;
            acc[date].count += 1;
            return acc;
        }, {} as Record<string, { date: string; cost: number; count: number; originalDate: Date }>);
        const sorted = Object.values(grouped).sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

        // Ensure at least 7 days of data
        const result: { date: string; cost: number; count: number }[] = [];
        const dateMap = new Map(sorted.map(item => [item.date, item]));

        // Get the earliest and latest dates
        if (sorted.length > 0) {
            const earliestDate = sorted[0].originalDate;
            const latestDate = sorted[sorted.length - 1].originalDate;

            // Generate 7 days starting from the earliest date, or use last 7 days if we have more data
            const startDate = sorted.length >= 7
                ? new Date(latestDate.getTime() - 6 * 24 * 60 * 60 * 1000) // Last 7 days
                : earliestDate;

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + i);
                const dateStr = format(currentDate, "MMM dd");
                const existing = dateMap.get(dateStr);
                result.push({
                    date: dateStr,
                    cost: existing?.cost || 0,
                    count: existing?.count || 0,
                });
            }
        } else {
            // If no data, generate 7 days from today going backwards
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                result.push({
                    date: format(date, "MMM dd"),
                    cost: 0,
                    count: 0,
                });
            }
        }

        return result;
    }, [data]);

    const modelDistribution = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        // Only consider rows with parent_id (exclude parent traces) and filter out spans without model names
        const filteredData = data.filter(span =>
            span.parent_id !== null &&
            span["attributes.llm.model_name"] &&
            span["attributes.llm.model_name"].trim() !== ""
        );
        const grouped = filteredData.reduce((acc, span) => {
            const model = span["attributes.llm.model_name"];
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
        // Only consider rows with parent_id (exclude parent traces)
        const filteredData = data.filter(span => span.parent_id !== null);
        const grouped = filteredData.reduce((acc, span) => {
            const kind = span["attributes.openinference.span.kind"] || "Unknown";
            if (!acc[kind]) {
                acc[kind] = { kind, count: 0 };
            }
            acc[kind].count += 1;
            return acc;
        }, {} as Record<string, { kind: string; count: number }>);
        return Object.values(grouped).sort((a, b) => b.count - a.count);
    }, [data]);

    const totalCost = React.useMemo(() => {
        // Only consider rows with parent_id (exclude parent traces)
        const filteredData = (data || []).filter(span => span.parent_id !== null);
        return filteredData.reduce((sum, span) => sum + (span["attributes.llm.cost.total"] || 0), 0);
    }, [data]);

    // Calculate message metrics (only for child spans with parent_id)
    const messageMetrics = React.useMemo(() => {
        const childSpans = (data || []).filter(span => span.parent_id !== null);
        const totalMessages = childSpans.length;

        const botSpans = childSpans.filter(span =>
            span.name?.toLowerCase().includes("bot")
        );
        const botMessages = botSpans.length;
        const botCost = botSpans.reduce((sum, span) => sum + (span["attributes.llm.cost.total"] || 0), 0);

        const userSpans = childSpans.filter(span =>
            !span.name?.toLowerCase().includes("bot")
        );
        const userMessages = userSpans.length;
        const userCost = userSpans.reduce((sum, span) => sum + (span["attributes.llm.cost.total"] || 0), 0);

        return { totalMessages, botMessages, botCost, userMessages, userCost };
    }, [data]);

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

    const botMessageCostConfig = {
        cost: {
            label: "Bot Message Cost",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig;

    const userMessageCostConfig = {
        cost: {
            label: "User Message Cost",
            color: "var(--chart-3)",
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
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Cost</CardDescription>
                        <CardTitle className="text-2xl">${totalCost.toFixed(4)}</CardTitle>
                        <CardDescription className="pt-1 text-xs">
                            {messageMetrics.totalMessages.toLocaleString()} messages
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Bot Message Cost</CardDescription>
                        <CardTitle className="text-2xl">${messageMetrics.botCost.toFixed(4)}</CardTitle>
                        <CardDescription className="pt-1 text-xs">
                            {messageMetrics.botMessages.toLocaleString()} messages
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>User Message Cost</CardDescription>
                        <CardTitle className="text-2xl">${messageMetrics.userCost.toFixed(4)}</CardTitle>
                        <CardDescription className="pt-1 text-xs">
                            {messageMetrics.userMessages.toLocaleString()} messages
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Cost Over Time */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Cost Over Time</CardTitle>
                        <CardDescription className="text-xs">Total cost per day</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <ChartContainer config={costConfig} className="h-[200px] w-full">
                            <AreaChart accessibilityLayer data={costOverTime}>
                                <defs>
                                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-cost)" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
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
                                <Area
                                    type="monotone"
                                    dataKey="cost"
                                    stroke="var(--color-cost)"
                                    strokeWidth={2}
                                    fill="url(#costGradient)"
                                    dot={false}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bot Message Cost & User Message Cost Over Time - Side by Side */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Bot Message Cost Over Time</CardTitle>
                        <CardDescription>Bot message cost per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={botMessageCostConfig} className="min-h-[200px] w-full">
                            <AreaChart accessibilityLayer data={botMessageCostOverTime}>
                                <defs>
                                    <linearGradient id="botMessageCostGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-cost)" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
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
                                <Area
                                    type="monotone"
                                    dataKey="cost"
                                    stroke="var(--color-cost)"
                                    strokeWidth={2}
                                    fill="url(#botMessageCostGradient)"
                                    dot={false}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Message Cost Over Time</CardTitle>
                        <CardDescription>User message cost per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={userMessageCostConfig} className="min-h-[200px] w-full">
                            <AreaChart accessibilityLayer data={userMessageCostOverTime}>
                                <defs>
                                    <linearGradient id="userMessageCostGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-cost)" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
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
                                <Area
                                    type="monotone"
                                    dataKey="cost"
                                    stroke="var(--color-cost)"
                                    strokeWidth={2}
                                    fill="url(#userMessageCostGradient)"
                                    dot={false}
                                />
                            </AreaChart>
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

