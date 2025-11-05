"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MonthlySpendingData } from "@/app/actions/analytics";
import { formatCurrency } from "@/lib/utils/currency";

type SpendingTrendChartProps = {
  data: MonthlySpendingData[];
  currency?: string;
};

export default function SpendingTrendChart({ data, currency = "IDR" }: SpendingTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>Monthly spending over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const firstValue = data[0]?.total || 0;
  const lastValue = data[data.length - 1]?.total || 0;
  const change = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Spending Trend</CardTitle>
        <CardDescription className="text-xs">
          Monthly spending over the last {data.length} months
          {change !== 0 && (
            <span
              className={`ml-2 text-xs font-semibold ${
                change > 0 ? "text-destructive" : "text-green-600"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => formatCurrency(value, currency).replace(/\.\d+$/, '')}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: number) => [formatCurrency(value, currency), "Total"]}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
