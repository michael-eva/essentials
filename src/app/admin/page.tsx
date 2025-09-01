"use client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function AdminPage() {
  const router = useRouter();
  const { data: videoStats, isLoading } = api.admin.getVideoStats.useQuery();

  const handleNavigateToLiveVideos = () => {
    router.push("/admin/videos");
  };

  const handleNavigateToDrafts = () => {
    router.push("/admin/drafts");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Upload New Class
              </h4>
              <p className="text-blue-700 text-sm mb-4">
                Upload video content and create new pilates classes with AI assistance.
              </p>
              <a
                href="/admin/class/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Class
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Stats Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Video Library Overview</CardTitle>
          <CardDescription>Current status of your video content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Videos Stat */}
            <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={handleNavigateToLiveVideos}>
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Live Videos</CardTitle>
                <CardDescription>Published pilates classes available to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? "..." : videoStats?.liveVideos ?? 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {isLoading ? "Loading..." : `${videoStats?.liveVideos === 1 ? "video" : "videos"} live`}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleNavigateToLiveVideos}>
                  Manage Live Videos
                </Button>
              </CardFooter>
            </Card>

            {/* Draft Videos Stat */}
            <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={handleNavigateToDrafts}>
              <CardHeader>
                <CardTitle className="text-lg text-orange-900">Draft Videos</CardTitle>
                <CardDescription>Videos in progress and pending publication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {isLoading ? "..." : videoStats?.draftVideos ?? 0}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {isLoading ? "Loading..." : `${videoStats?.draftVideos === 1 ? "draft" : "drafts"} in progress`}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleNavigateToDrafts}>
                  View All Drafts
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}