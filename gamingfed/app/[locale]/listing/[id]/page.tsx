import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailView } from "@/components/listings/ListingDetailView";
import { getCurrentUser } from "@/lib/auth";
import { buildWhatsAppHref } from "@/lib/format";
import { KYC } from "@/lib/status";
import { gameService } from "@/services";
import type { ListingDoc, ListingSeller } from "@/services/types";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { game } = await gameService.getGame(id);
    return {
      title: `${game.title} | Kerala Hub`,
      description: game.description?.slice(0, 160) ?? `Buy ${game.title} on Kerala Hub.`,
    };
  } catch {
    return { title: "Listing | Kerala Hub" };
  }
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  let listing: ListingDoc | null = null;
  try {
    const res = await gameService.getGame(id);
    listing = res.game;
  } catch {
    notFound();
  }
  if (!listing) notFound();

  const user = await getCurrentUser();
  const signedIn = Boolean(user);
  const viewerKycApproved = signedIn && Number(user?.kycStatus) === KYC.APPROVED;

  const seller =
    listing.seller && typeof listing.seller === "object"
      ? (listing.seller as ListingSeller)
      : null;
  const canRevealContact = viewerKycApproved && Boolean(seller);

  const sellerId =
    seller?._id ??
    (typeof listing.seller === "string" ? listing.seller : undefined);
  const isOwner = Boolean(user && sellerId && user._id === sellerId);
  const isSold = listing.status === "sold";
  const chatHref =
    sellerId && listing._id
      ? `/chat?listing=${encodeURIComponent(listing._id)}&seller=${encodeURIComponent(sellerId)}`
      : "/chat";

  const whatsAppHref =
    viewerKycApproved && seller
      ? buildWhatsAppHref(
          seller.whatsapp || seller.phone,
          `Hi — I'm interested in "${listing.title}" on Kerala Hub.`,
        )
      : null;

  return (
    <ListingDetailView
      listing={listing}
      signedIn={signedIn}
      viewerKycApproved={viewerKycApproved}
      seller={seller}
      canRevealContact={canRevealContact}
      isOwner={isOwner}
      isSold={isSold}
      chatHref={chatHref}
      whatsAppHref={whatsAppHref}
    />
  );
}
