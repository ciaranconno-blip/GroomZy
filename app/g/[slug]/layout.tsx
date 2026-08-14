import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/business-lookup";
import { BusinessProvider } from "@/lib/BusinessContext";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) notFound();

  return <BusinessProvider business={business}>{children}</BusinessProvider>;
}
