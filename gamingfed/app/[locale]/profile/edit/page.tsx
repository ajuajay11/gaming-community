import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { profileService } from "@/services/profile.service";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";

export const metadata = {
  title: "Edit profile — Kerala Hub",
};

export default async function EditProfilePage() {
  await requireUser("/profile/edit");

  const account = await profileService.getMyAccount().catch(() => null);

  return (
    <main className="container mx-auto px-4 pt-4 pb-28">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">Edit profile</h1>
      <p className="mt-1 text-sm text-gray-400">
        Your public identity on Kerala Hub. Legal details (KYC) are managed separately.
      </p>
      <ProfileEditForm
        initial={{
          displayName: account?.profile?.displayName ?? "",
          username: account?.profile?.username ?? "",
          bio: account?.profile?.bio ?? "",
          avatarUrl: account?.profile?.avatarUrl ?? "",
          locale: account?.profile?.locale ?? "en",
          whatsapp: account?.profile?.whatsapp ?? "",
        }}
      />
    </main>
  );
}
