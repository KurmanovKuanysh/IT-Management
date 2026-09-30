import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">My profile</h1>
        <p className="text-sm text-muted">{user.email}</p>
      </div>
      <ProfileForm user={{ name: user.name, bio: user.bio, avatarUrl: user.avatarUrl }} />
    </div>
  );
}
