"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { BillingCycleData } from "@/app/actions/analytics";
import { useState, useEffect } from "react";

type BillingCycleChartProps = {
  data: BillingCycleData[];
};

const COLORS = {
  monthly: "hsl(var(--chart-1))",
  yearly: "hsl(var(--chart-2))",
  quarterly: "hsl(var(--chart-3))",
  weekly: "hsl(var(--chart-4))",
};

export default function BillingCycleChart({ data }: BillingCycleChartProps) {
  const [fontSize, setFontSize] = useState(11);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setFontSize(10); // Mobile
      } else if (width < 1024) {
        setFontSize(11); // Tablet
      } else {
        setFontSize(12); // Desktop
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Cycle Distribution</CardTitle>
          <CardDescription>Breakdown by payment frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map((item) => ({
    name: item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1),
    value: item.count,
    cost: item.totalCost,
    frequency: item.frequency,
    percent: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Billing Cycle Distribution</CardTitle>
        <CardDescription className="text-xs">
          {data.reduce((sum, item) => sum + item.count, 0)} active subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
              label={(props: any) => {
                const percent = props.percent || 0;
                const RADIAN = Math.PI / 180;
                const radius = props.outerRadius + 15;
                const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
                const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill={props.fill}
                    textAnchor={x > props.cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fontWeight="500"
                  >
                    {`${props.name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.frequency as keyof typeof COLORS] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: number, name: string, props) => [
                `${value} subscription${value !== 1 ? "s" : ""} ($${props.payload.cost.toFixed(
                  2
                )}/mo)`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary Cards */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {data.map((item) => (
            <div
              key={item.frequency}
              className="flex flex-col rounded-md border p-2"
            >
              <span className="text-xs text-muted-foreground capitalize">
                {item.frequency}
              </span>
              <span className="text-base font-semibold">
                {item.count} {item.count === 1 ? "plan" : "plans"}
              </span>
              <span className="text-xs text-muted-foreground">
                ${item.totalCost.toFixed(2)}/mo
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
