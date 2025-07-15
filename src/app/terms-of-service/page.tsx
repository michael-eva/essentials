"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Terms of Service
            </CardTitle>
            <p className="text-gray-600">Last updated: January 15, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed text-gray-700">
                By accessing and using ESSENTIAL.PT services, you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                2. Description of Service
              </h2>
              <p className="leading-relaxed text-gray-700">
                ESSENTIAL.PT provides fitness training, nutrition guidance, and
                wellness coaching services. Our platform connects users with
                certified trainers and provides personalized workout plans,
                dietary recommendations, and progress tracking tools.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                3. User Responsibilities
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>You must be at least 18 years old to use our services</li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account
                </li>
                <li>You agree to provide accurate and complete information</li>
                <li>You will not use the service for any unlawful purposes</li>
                <li>
                  You acknowledge that fitness activities carry inherent risks
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                4. Health and Safety Disclaimer
              </h2>
              <p className="leading-relaxed text-gray-700">
                Before beginning any fitness program, you should consult with
                your physician. ESSENTIAL.PT is not responsible for any injuries
                that may occur as a result of following our programs. Always
                listen to your body and stop if you experience pain or
                discomfort.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                5. Payment and Cancellation
              </h2>
              <p className="leading-relaxed text-gray-700">
                Subscription fees are billed monthly or annually as selected.
                You may cancel your subscription at any time through your
                account settings. Cancellations take effect at the end of the
                current billing period. No refunds are provided for partial
                months.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                6. Intellectual Property
              </h2>
              <p className="leading-relaxed text-gray-700">
                All content, including but not limited to workout plans, videos,
                articles, and software, is the property of ESSENTIAL.PT and is
                protected by copyright and other intellectual property laws. You
                may not reproduce, distribute, or create derivative works
                without permission.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                7. Limitation of Liability
              </h2>
              <p className="leading-relaxed text-gray-700">
                ESSENTIAL.PT shall not be liable for any direct, indirect,
                incidental, special, or consequential damages resulting from the
                use or inability to use our services, even if we have been
                advised of the possibility of such damages.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                8. Changes to Terms
              </h2>
              <p className="leading-relaxed text-gray-700">
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting. Your continued use
                of the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                9. Contact Information
              </h2>
              <p className="leading-relaxed text-gray-700">
                If you have any questions about these Terms of Service, please
                contact us at:
                <br />
                Email: legal@essential.pt
                <br />
                Phone: +61 8 1234 5678
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
