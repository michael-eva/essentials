import Link from "next/link";
import AdminRoute from "@/components/auth/AdminRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <nav className="flex space-x-8">
                <a
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <Link
                  href="/dashboard"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Back to App
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <main>{children}</main>
      </div>
    </AdminRoute>
  );
}