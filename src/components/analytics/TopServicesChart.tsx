"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TopServiceData } from "@/app/actions/analytics";
import { formatCurrency } from "@/lib/utils/currency";

type TopServicesChartProps = {
  data: TopServiceData[];
  limit?: number;
  currency?: string;
};

export default function TopServicesChart({ data, limit = 5, currency = "IDR" }: TopServicesChartProps) {
  const displayData = data.slice(0, limit);

  if (displayData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Expensive Services</CardTitle>
          <CardDescription>Your highest-cost subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No active subscriptions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Top {limit} Expensive Services</CardTitle>
        <CardDescription className="text-xs">Ranked by monthly equivalent cost</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={displayData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => formatCurrency(value, currency).replace(/\.\d+$/, '')}
            />
            <YAxis
              type="category"
              dataKey="serviceName"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: number) => [
                `${formatCurrency(value, currency)}/mo`,
                "Cost",
              ]}
            />
            <Bar
              dataKey="monthlyEquivalent"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
