"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Key, Mail } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateAccessCode = api.waitlist.validateAccessCode.useMutation({
    onSuccess: () => {
      localStorage.setItem("essentials_access_granted", "true");
      router.push("/auth");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const joinWaitlist = api.waitlist.join.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      setFullName("");
      setEmail("");
      setShowWaitlistForm(false);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  useEffect(() => {
    // Check if user already has access
    const hasAccess = localStorage.getItem("essentials_access_granted");
    if (hasAccess === "true") {
      router.push("/auth");
    }
  }, [router]);

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    validateAccessCode.mutate({ accessCode });
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    joinWaitlist.mutate({ fullName, email });
  };

  const resetForms = () => {
    setShowAccessForm(false);
    setShowWaitlistForm(false);
    setAccessCode("");
    setFullName("");
    setEmail("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{successMessage}</p>
            <p className="text-sm text-gray-500">
              We'll notify you as soon as we're ready to welcome you to Essentials.
            </p>
            <Button onClick={resetForms} variant="outline" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Essentials</h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            We're currently in testing phase and not open to the public yet. 
            Join our waitlist or enter your access code to continue.
          </p>
        </div>

        {/* Main Options Card */}
        {!showAccessForm && !showWaitlistForm && (
          <Card>
            <CardHeader>
              <CardTitle>Get Access</CardTitle>
              <CardDescription>
                Choose how you'd like to proceed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowAccessForm(true)}
                className="w-full"
                variant="default"
              >
                <Key className="w-4 h-4 mr-2" />
                I have an access code
              </Button>
              <Button
                onClick={() => setShowWaitlistForm(true)}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Join the waitlist
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Access Code Form */}
        {showAccessForm && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Access Code</CardTitle>
              <CardDescription>
                Enter the access code you were provided
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code</Label>
                  <Input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter your access code"
                    required
                  />
                </div>
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={validateAccessCode.isPending}
                  >
                    {validateAccessCode.isPending ? "Validating..." : "Continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForms}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Waitlist Form */}
        {showWaitlistForm && (
          <Card>
            <CardHeader>
              <CardTitle>Join Our Waitlist</CardTitle>
              <CardDescription>
                Be the first to know when we launch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={joinWaitlist.isPending}
                  >
                    {joinWaitlist.isPending ? "Joining..." : "Join Waitlist"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForms}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-gray-500">
          © 2025 Essentials. All rights reserved.
        </div>
      </div>
    </div>
  );
}
