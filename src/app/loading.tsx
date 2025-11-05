import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-3 w-48 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
