"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Copy, Check, Share, Gift, Users, Mail, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/trpc/react";

interface ReferralSharingProps {
  referralLink: string;
  userId?: string; // Added to identify the user sending invitations
  rewards?: Array<{
    userId: string;
    rewardType: 'base_signup' | 'referral_bonus' | 'referrer_reward';
    monthsCount: number;
    description: string;
  }>;
  totalFreeMonths?: number;
}

export default function ReferralSharing({
  referralLink,
  userId,
  rewards = [],
  totalFreeMonths
}: ReferralSharingProps) {
  const [copied, setCopied] = useState(false);
  const [emailInputs, setEmailInputs] = useState<string[]>(['']);
  const [sendingInvites, setSendingInvites] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Essentials Waitlist',
          text: 'Get 2 free months when you join the Essentials waitlist through my referral link!',
          url: referralLink,
        });
      } catch (err) {
        console.log('Native share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  const addEmailInput = () => {
    setEmailInputs([...emailInputs, '']);
  };

  const removeEmailInput = (index: number) => {
    if (emailInputs.length > 1) {
      setEmailInputs(emailInputs.filter((_, i) => i !== index));
    }
  };

  const updateEmailInput = (index: number, value: string) => {
    const newInputs = [...emailInputs];
    newInputs[index] = value;
    setEmailInputs(newInputs);
  };

  const validateEmails = () => {
    const validEmails = emailInputs.filter(email => {
      const trimmed = email.trim();
      return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    });
    return validEmails;
  };

  // API mutation for sending referral invitations
  const sendInvitationsMutation = api.waitlist.sendReferralInvitations.useMutation({
    onSuccess: (data) => {
      toast.success(`✉️ ${data.message}`);
      setEmailInputs(['']); // Reset form
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invitations. Please try again.');
    },
    onSettled: () => {
      setSendingInvites(false);
    }
  });

  const sendEmailInvitations = async () => {
    const validEmails = validateEmails();

    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please refresh the page.');
      return;
    }

    setSendingInvites(true);

    sendInvitationsMutation.mutate({
      userId: userId,
      emails: validEmails,
      referralLink: referralLink,
    });
  };

  const currentUserRewards = rewards.filter(r => r.rewardType !== 'referrer_reward');
  const totalRewardedMonths = currentUserRewards.reduce((sum, r) => sum + r.monthsCount, 0);

  return (
    <div className="space-y-6">
      {/* Referral Sharing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-brand-cobalt rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-brand-brown">Invite Your Friends</CardTitle>
            <CardDescription className="text-brand-brown/70">
              Share your referral link and both you and your friends will get free months!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral Benefits */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-brand-light-yellow border border-brand-brown rounded-lg">
                <div className="text-2xl font-bold text-brand-cobalt">+1</div>
                <div className="text-sm text-brand-brown/70">Month free for you</div>
              </div>
              <div className="p-4 bg-brand-light-yellow border border-brand-brown rounded-lg">
                <div className="text-2xl font-bold text-brand-cobalt">+2</div>
                <div className="text-sm text-brand-brown/70">Months free for them</div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <Label htmlFor="referralLink" className="text-brand-brown">
                Your Referral Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="referralLink"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  onClick={copyToClipboard}
                  variant="outline"
                  className="px-3"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={shareNative}
                  variant="outline"
                  className="px-3"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Email Invitations */}
            <div className="space-y-3">
              <Label className="text-brand-brown">
                Or Send Email Invitations
              </Label>
              <div className="space-y-3">
                {emailInputs.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="friend@email.com"
                      value={email}
                      onChange={(e) => updateEmailInput(index, e.target.value)}
                      className="flex-1"
                    />
                    {emailInputs.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeEmailInput(index)}
                        variant="outline"
                        size="icon"
                        className="px-3"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="justify-end flex">

                  <Button
                    type="button"
                    onClick={addEmailInput}
                    variant="outline"
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Email
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={sendEmailInvitations}
                    disabled={sendingInvites}
                    className="flex-1"
                  >
                    {sendingInvites ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invites
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="text-sm text-brand-brown/60 space-y-1">
              <p><strong>How it works:</strong></p>
              <p>1. Share your link with friends</p>
              <p>2. They join the waitlist using your link</p>
              <p>3. You both get free months when we launch!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}