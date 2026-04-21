import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { redirectLocal } from "@/lib/i18n-redirect";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { gameService } from "@/services/game.service";
import { EditListingForm } from "@/components/sell/EditListingForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit listing — Kerala Hub",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser(`/sell/manage/${id}/edit`);

  const res = await gameService.getGame(id).catch(() => null);
  const listing = res?.game;
  if (!listing) notFound();

  // `seller` may be populated (object with _id) or a raw string depending on auth.
  const sellerId =
    typeof listing.seller === "string"
      ? listing.seller
      : listing.seller?._id ?? null;
  if (sellerId !== user._id) {
    return redirectLocal("/sell/manage");
  }

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <Link
        href="/sell/manage"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to my listings
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">Edit listing</h1>
      <p className="mt-1 text-sm text-gray-400">
        Fine-tune the details below. Media uploads stay as-is — delete &amp; re-create the listing to change photos.
      </p>
      <EditListingForm listing={listing} />
    </main>
  );
}
