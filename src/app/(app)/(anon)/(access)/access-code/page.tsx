import { AccessCodeScreen } from "@/screens/access";

interface PageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AccessCodePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  return <AccessCodeScreen error={resolvedSearchParams?.error} />;
}
