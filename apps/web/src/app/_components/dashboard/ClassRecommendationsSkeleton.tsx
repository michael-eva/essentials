import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ActivePlanSkeleton() {
  return (
    <Card className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((week) => (
            <div key={week} className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PreviousPlansSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((plan) => (
        <Card key={plan} className="border border-gray-100 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {[1, 2].map((week) => (
                <div key={week} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 