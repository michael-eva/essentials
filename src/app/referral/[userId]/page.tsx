"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import ReferralSharing from "@/app/_components/waitlist/ReferralSharing";

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const searchParams = useSearchParams();
  const referrerId = searchParams.get("ref");

  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch referral link for the user
  const {
    data: linkData,
    error: linkError,
    isLoading: linkLoading
  } = api.waitlist.generateReferralLink.useQuery(
    { userId },
    {
      enabled: !!userId && userId.length === 36, // Valid UUID length
      retry: 1
    }
  );

  // Fetch referral analytics for the user
  const {
    data: analytics,
    error: analyticsError,
    isLoading: analyticsLoading
  } = api.waitlist.getReferralAnalytics.useQuery(
    { userId },
    {
      enabled: !!userId && userId.length === 36,
      retry: 1
    }
  );
  const confirmUserMutation = api.waitlist.confirmUser.useMutation({
    onSuccess: () => {
      setIsValidUser(true);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Failed to confirm user:', error);
      setIsValidUser(false);
      setIsLoading(false);
    }
  });
  useEffect(() => {
    if (linkData || analytics) {
      setIsValidUser(true);
      setIsLoading(false);
    } else if (linkError || analyticsError) {
      setIsValidUser(false);
      setIsLoading(false);

      if (linkError?.data?.code === 'NOT_FOUND') {
        toast.error("User not found in waitlist");
      } else {
        toast.error("Failed to load referral information");
      }
    }
  }, [linkData, analytics, linkError, analyticsError]);
  useEffect(() => {
    if (userId) {
      confirmUserMutation.mutate({ userId, referrerId: referrerId ?? undefined });
    }
  }, [userId]);


  // Show loading state
  if (isLoading || linkLoading || analyticsLoading || confirmUserMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-cobalt" />
          <p className="text-brand-brown/70">Loading your referral information...</p>
        </div>
      </div>
    );
  }

  // Show error state for invalid user
  if (isValidUser === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Card className="shadow-lg">
            <CardContent className="px-8 py-6 text-center">
              <img src="/logo/essentials_pt_logo.png" alt="logo" className="rounded-lg mx-auto mb-6 max-w-[200px]" />
              <h2 className="text-2xl font-bold text-brand-brown mb-4">
                User Not Found
              </h2>
              <p className="text-brand-brown/70 mb-6">
                This referral link appears to be invalid or the user is not in our waitlist.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                Join Waitlist
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Convert analytics data to rewards format for display
  const mockRewards = analytics?.totalFreeMonths ? [{
    userId,
    rewardType: 'base_signup' as const,
    monthsCount: analytics.totalFreeMonths,
    description: `Total free months earned: ${analytics.totalFreeMonths}`,
  }] : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="space-y-6">
          {/* Referral Sharing Component */}
          {linkData?.referralLink && (
            <ReferralSharing
              referralLink={linkData.referralLink}
              userId={userId}
              rewards={mockRewards}
              totalFreeMonths={analytics?.totalFreeMonths}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
