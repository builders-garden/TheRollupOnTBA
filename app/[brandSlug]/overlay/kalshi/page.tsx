import { notFound } from "next/navigation";
import { getBrandBySlug } from "@/lib/database/queries";
import { OverlayKalshi } from "@/components/pages/overlay/kalshi";

export default async function OverlayKalshiPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) {
    return notFound();
  }

  return <OverlayKalshi brand={brand} />;
}
