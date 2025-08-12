"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const waitlistSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  accessCode: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const ACCESS_CODE_STORAGE_KEY = "essentials_access_code_validated";

export default function WaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [hasValidAccessCode, setHasValidAccessCode] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const accessCodeValue = watch("accessCode");

  // Check for previously validated access code
  useEffect(() => {
    const storedValidation = localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
    if (storedValidation === "true") {
      setHasValidAccessCode(true);
      // If user has valid access code, redirect to auth
      router.push("/auth");
    }
  }, [router]);

  const submitWaitlistMutation = api.waitlist.submitWaitlist.useMutation({
    onSuccess: (data) => {
      setIsSubmitted(true);

      if (data.hasValidAccessCode) {
        localStorage.setItem(ACCESS_CODE_STORAGE_KEY, "true");
        toast.success(data.message);
        // Redirect to auth page after a short delay
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
      } else {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validateAccessCodeMutation = api.waitlist.validateAccessCode.useMutation({
    onSuccess: (data) => {
      if (data.isValid) {
        localStorage.setItem(ACCESS_CODE_STORAGE_KEY, "true");
        toast.success(data.message);
        router.push("/auth");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: WaitlistFormData) => {
    submitWaitlistMutation.mutate(data);
  };

  const handleAccessCodeSubmit = () => {
    if (!accessCodeValue?.trim()) {
      toast.error("Please enter an access code");
      return;
    }
    validateAccessCodeMutation.mutate({ accessCode: accessCodeValue });
  };

  if (isSubmitted && !hasValidAccessCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-light-yellow to-brand-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-brand-cobalt rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-brand-brown mb-4">
                Thank you for joining our waitlist!
              </h2>
              <p className="text-brand-brown/70 mb-6">
                We&apos;ll notify you when Essentials is ready for you to experience.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                Back to Form
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-light-yellow to-brand-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-brand-brown">
              Join Essentials
            </CardTitle>
            <CardDescription className="text-brand-brown/70">
              Be among the first to experience personalised fitness training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-brand-brown">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-brown">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-brown/70">
                    Have an access code?
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    className="text-brand-cobalt hover:text-brand-cobalt/80"
                  >
                    {showAccessCode ? "Hide" : "Enter Code"}
                  </Button>
                </div>

                {showAccessCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="accessCode" className="text-brand-brown">
                      Access Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="accessCode"
                        {...register("accessCode")}
                        placeholder="Enter access code"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAccessCodeSubmit}
                        disabled={validateAccessCodeMutation.isPending}
                        className="px-6"
                      >
                        {validateAccessCodeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitWaitlistMutation.isPending}
              >
                {submitWaitlistMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-brand-brown/60">
                By joining, you agree to receive updates about Essentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}