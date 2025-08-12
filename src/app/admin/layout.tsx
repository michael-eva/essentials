import { redirect } from "next/navigation";
import { createClient } from "~/lib/supabase/client";
import { env } from "~/env";

async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user has admin access
  if (env.NEXT_PUBLIC_USER_ROLE !== "DEVELOPER") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;