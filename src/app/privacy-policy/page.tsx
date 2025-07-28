"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
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
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: January 15, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">
                1. Information We Collect
              </h2>
              <p className="mb-3 leading-relaxed text-gray-700">
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support.
              </p>
              <h3 className="mb-2 text-lg font-medium">
                Personal Information:
              </h3>
              <ul className="list-disc space-y-1 pl-6 text-gray-700">
                <li>Name, email address, and contact information</li>
                <li>Age, gender, height, weight, and fitness goals</li>
                <li>Health conditions and fitness history</li>
                <li>
                  Payment information (processed securely by third parties)
                </li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-medium">
                Usage Information:
              </h3>
              <ul className="list-disc space-y-1 pl-6 text-gray-700">
                <li>Workout completion data and progress metrics</li>
                <li>App usage patterns and preferences</li>
                <li>Device information and IP address</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>Provide and personalise our fitness services</li>
                <li>Create customised workout and nutrition plans</li>
                <li>Track your progress and provide recommendations</li>
                <li>Process payments and manage your subscription</li>
                <li>Send important updates and promotional communications</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                3. Information Sharing
              </h2>
              <p className="mb-3 leading-relaxed text-gray-700">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information in the following
                circumstances:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>With your consent:</strong> When you explicitly agree
                  to share information
                </li>
                <li>
                  <strong>Service providers:</strong> Third-party companies that
                  help us operate our platform
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Business transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Data Security</h2>
              <p className="leading-relaxed text-gray-700">
                We implement appropriate technical and organisational measures
                to protect your personal information against unauthorised
                access, alteration, disclosure, or destruction. This includes
                encryption, secure servers, and regular security assessments.
                However, no method of transmission over the internet is 100%
                secure.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Data Retention</h2>
              <p className="leading-relaxed text-gray-700">
                We retain your personal information for as long as necessary to
                provide our services and fulfil the purposes outlined in this
                policy. When you delete your account, we will delete or
                anonymise your personal information within 30 days, except where
                we are required to retain it for legal or regulatory purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. Your Rights</h2>
              <p className="mb-3 leading-relaxed text-gray-700">
                Depending on your location, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data to
                  another service
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain processing of
                  your information
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of
                  processing in certain circumstances
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                7. Cookies and Tracking
              </h2>
              <p className="leading-relaxed text-gray-700">
                We use cookies and similar technologies to enhance your
                experience, analyse usage patterns, and provide personalised
                content. You can control cookie settings through your browser,
                but disabling cookies may affect the functionality of our
                services.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                8. Children&apos;s Privacy
              </h2>
              <p className="leading-relaxed text-gray-700">
                Our services are not intended for children under 18 years of
                age. We do not knowingly collect personal information from
                children. If we become aware that we have collected information
                from a child, we will take steps to delete such information
                promptly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                9. International Data Transfers
              </h2>
              <p className="leading-relaxed text-gray-700">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your information in accordance with
                applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                10. Changes to This Policy
              </h2>
              <p className="leading-relaxed text-gray-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new policy on
                our website and updating the &quot;Last updated&quot; date. Your continued
                use of our services constitutes acceptance of the updated
                policy.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">11. Contact Us</h2>
              <p className="leading-relaxed text-gray-700">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us at:
                <br />
                Email: privacy@essential.pt
                <br />
                Phone: +61 8 1234 5678
                <br />
                Address: 123 Fitness Street, Perth WA 6000, Australia
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
