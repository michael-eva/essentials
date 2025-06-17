
import { STEPS } from "../constants";
import { use } from "react";
import OnboardingPageClient from "./OnboardingPageClient";

export function generateStaticParams() {
    return STEPS.map((tab) => ({
        tab,
    }));
}

type PageProps = {
    params: Promise<{ tab: string }>;
}

export default function Page({ params }: PageProps) {
    const resolvedParams = use(params);
    return <OnboardingPageClient params={resolvedParams} />;
}