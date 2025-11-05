"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { InsightData } from "@/app/actions/analytics";

type InsightsPanelProps = {
  insights: InsightData[];
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  const getIcon = (type: InsightData["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5" style={{ color: '#3EBCB3' }} />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: InsightData["type"]) => {
    switch (type) {
      case "warning":
        return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50";
      case "success":
        return "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700/50";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50";
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions to optimize your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 mb-3" style={{ color: '#3EBCB3' }} />
            <p className="text-lg font-semibold text-muted-foreground">
              All looking good!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              No recommendations at this time. Keep managing your subscriptions wisely.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Recommendations</CardTitle>
        <CardDescription>
          {insights.length} suggestion{insights.length !== 1 ? "s" : ""} to help you save
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`rounded-lg border p-4 ${getBgColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                {insight.actionLabel && insight.actionUrl && (
                  <Link href={insight.actionUrl}>
                    <Button variant="link" className="h-auto p-0 text-sm">
                      {insight.actionLabel}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
