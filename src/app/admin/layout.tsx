import { redirect } from "next/navigation";
import { env } from "@/env";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only allow access if user role is DEVELOPER
  if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <nav className="flex space-x-8">
              <a
                href="/admin/class/new"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Upload Class
              </a>
              <a
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to App
              </a>
            </nav>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}