// Force dynamic rendering and prevent caching for the new class page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NewClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
