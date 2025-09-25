import { notFound } from "next/navigation";
import { OverlaySentiment } from "@/components/pages/overlay/sentiment";
import { getBrandBySlug } from "@/lib/database/queries";

export default async function OverlaySentimentPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) {
    return notFound();
  }

  return <OverlaySentiment brand={brand} />;
}
