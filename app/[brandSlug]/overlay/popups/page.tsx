import { notFound } from "next/navigation";
import { OverlayPopups } from "@/components/pages/overlay/popups";
import { getBrandBySlug } from "@/lib/database/queries";

export default async function OverlayPopupsPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) {
    return notFound();
  }

  return <OverlayPopups brand={brand} />;
}
