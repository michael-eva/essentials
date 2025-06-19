import DashboardTabs from "./DashboardTabs";
import { use } from "react";

// Define the possible tab values
export function generateStaticParams() {
  return [
    { tabs: 'overview' },
    { tabs: 'your-plan' },
    { tabs: 'history' },
    { tabs: 'mypt' },
    { tabs: 'classes' }
  ]
}

type PageProps = {
  params: Promise<{
    tabs: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { tabs } = use(params);
  return <DashboardTabs tabs={tabs} />;
}
