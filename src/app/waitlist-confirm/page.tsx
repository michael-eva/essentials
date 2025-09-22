"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

const RESEND_COOLDOWN_SECONDS = 10;

const WaitlistConfirmContent = () => {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const resendEmailMutation = api.waitlist.resendConfirmationEmail.useMutation();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldown]);

  const isCooldownActive = cooldown > 0;
  if (!id || !email) {
    return <div>Invalid link</div>;
  }

  const resendEmail = () => {
    if (isCooldownActive || resendEmailMutation.isPending) {
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
    resendEmailMutation.mutate({ userId: id, email: email, referrerId: ref ?? undefined });
  };
  return (
    <div className="bg-white flex items-center flex-col justify-center h-screen">
      <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center">
        <Image
          src="/logo/essentials_pt_logo.png"
          alt="Essentials logo"
          width={120}
          height={120}
          className="rounded-lg mb-6"
          priority
        />
        <h2 className="text-2xl font-bold">A confirmation email has been sent to your email address</h2>
        <p className="text-sm text-brand-brown/60">Please check your email and click the link to confirm your email address</p>
      </div>
      <Button
        onClick={resendEmail}
        disabled={isCooldownActive || resendEmailMutation.isPending}
      >
        {resendEmailMutation.isPending ? "Resending..." : "Resend Email"}
      </Button>
      {isCooldownActive && (
        <p className="mt-2 text-sm text-brand-brown/60">
          You can resend the email in {cooldown} second{cooldown === 1 ? "" : "s"}.
        </p>
      )}

    </div>
  );
};

const WaitlistConfirmPage = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-white flex items-center flex-col justify-center h-screen">
          <p className="text-sm text-brand-brown/60">Loading confirmation details...</p>
        </div>
      }
    >
      <WaitlistConfirmContent />
    </Suspense>
  );
};

export default WaitlistConfirmPage;
