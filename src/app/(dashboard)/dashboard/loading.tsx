import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPageLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Section Skeleton */}
      <div>
        <Skeleton className="h-9 w-80 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
