"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resetPasswordForEmail } from "@/services/auth-helpers";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordForEmail(email);
      setIsEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when modal closes
    setTimeout(() => {
      setEmail("");
      setIsEmailSent(false);
      setIsLoading(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white/90 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-brand-black">
            {isEmailSent ? "Check Your Email" : "Reset Password"}
          </DialogTitle>
          <DialogDescription className="text-brand-black/70">
            {isEmailSent 
              ? "We've sent you a password reset link. Check your email and follow the instructions to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."
            }
          </DialogDescription>
        </DialogHeader>

        {!isEmailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-brand-light-yellow rounded-lg text-brand-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-cobalt focus:border-transparent transition-all"
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent text-brand-black border-gray-300 hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-brand-bright-orange text-white py-3 rounded-lg font-semibold hover:bg-brand-bright-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="pt-2">
            <Button
              onClick={handleClose}
              className="w-full bg-brand-bright-orange text-white hover:bg-brand-bright-orange/90"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}