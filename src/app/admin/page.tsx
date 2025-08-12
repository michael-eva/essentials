import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Video, Plus, Database, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your pilates content and platform settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Management</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <CardDescription>
                Upload and manage pilates class videos
              </CardDescription>
              <Link href="/admin/class/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload New Class
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              View and manage database records
            </CardDescription>
            <Button variant="outline" className="w-full mt-2" disabled>
              <Database className="mr-2 h-4 w-4" />
              Database Tools (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
            <Button variant="outline" className="w-full mt-2" disabled>
              <Users className="mr-2 h-4 w-4" />
              User Tools (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}