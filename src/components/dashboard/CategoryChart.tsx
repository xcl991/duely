"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { useState, useEffect } from "react";
import { useTranslations } from "@/lib/i18n/hooks";
import Link from "next/link";
import { FolderPlus, Plus } from "lucide-react";

// Flexible type that accepts both dashboard and analytics category data
type CategoryData = {
  categoryId?: string | null;  // From dashboard
  id?: string;                  // From analytics
  categoryName?: string;         // From dashboard
  name?: string;                 // From analytics
  total: number;
  count: number;
  percentage: number;
  color: string | null;
};

type CategoryChartProps = {
  data: CategoryData[];
  currency?: string;
};

export default function CategoryChart({ data, currency = "IDR" }: CategoryChartProps) {
  const [fontSize, setFontSize] = useState(11);
  const t = useTranslations();

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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.categoryBreakdown')}</CardTitle>
          <CardDescription>{t('common.noData')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
          <p className="text-muted-foreground text-center px-4">{t('subscriptions.noSubscriptionsDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-3 w-full px-4 sm:px-0 sm:w-auto">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-10 px-4"
            >
              <FolderPlus className="h-4 w-4" />
              {t('categories.addCategory')}
            </Link>
            <Link
              href="/subscriptions"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow hover:from-teal-600 hover:to-teal-700 hover:shadow-lg h-10 px-4"
            >
              <Plus className="h-4 w-4" />
              {t('subscriptions.addSubscription')}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName || item.name || 'Unknown',
    value: item.total,
    count: item.count,
    color: item.color || '#8884d8',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value, currency)} ({t('categories.subscriptionCount', { count: data.count })})
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {payload.map((entry: any, index: number) => {
          const percentage = data[index]?.percentage || 0;
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {entry.value} ({percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t('dashboard.categoryBreakdown')}</CardTitle>
        <CardDescription className="text-xs">{t('analytics.categoryDistribution')}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="40%"
              labelLine={false}
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
              outerRadius={75}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
