import { ItemDetailClient } from "@/components/ItemDetailClient";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ItemDetailClient id={id} />;
}
