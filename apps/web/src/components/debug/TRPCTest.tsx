'use client';

import { api } from '@/trpc/react';

export function TRPCTest() {
  const { data, error, isLoading } = api.workoutPlan.getOnboardingCompletion.useQuery();
  
  if (isLoading) {
    return (
      <div className="p-4 border rounded bg-blue-50">
        <h3 className="font-semibold">tRPC Connection Test</h3>
        <p>🔄 Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border rounded bg-red-50">
        <h3 className="font-semibold">tRPC Connection Test</h3>
        <p className="text-red-500">❌ Error: {error.message}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm">Error Details</summary>
          <pre className="text-xs mt-1 bg-red-100 p-2 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded bg-green-50">
      <h3 className="font-semibold">tRPC Connection Test</h3>
      <p className="text-green-500">✅ Connected! Onboarding complete: {data?.toString()}</p>
    </div>
  );
}
