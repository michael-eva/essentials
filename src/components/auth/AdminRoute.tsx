"use client";

import { useUser } from "@/hooks/useUserWithRole";
import { Button } from "../ui/button";
import Link from "next/link";
import { CoolLoading } from "../ui/cool-loading";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CoolLoading size="lg" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (<>
      <div className="flex flex-col items-center justify-center h-screen">
        <div>You are not authorized to access this page</div>
        <Link href="/dashboard">
          <Button>
            Go to Home
          </Button>
        </Link>
      </div>
    </>);
  }

  return <>{children}</>;
}
