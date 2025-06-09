import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Classes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionType = searchParams.get("sessionType");

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors pt-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="w-full">
        {/* @ts-expect-error - hapana-widget is not a valid HTML element */}
        <hapana-widget data-type="classes" widget-id="a3NHYThQaytzMko2UEJGQ25FMXU5UT09" instructor-id="" session-type={sessionType} ></hapana-widget>
      </div>
      <Script src="https://widget.hapana.com/hapana_widget.js" strategy="afterInteractive" />
    </div>
  )
}