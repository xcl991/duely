import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Ensure user matches ProfileClient props type
  const profileUser = {
    id: user.id,
    name: user.name ?? null,
    email: user.email || "",
    image: user.image ?? null,
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileClient user={profileUser} />
    </div>
  );
}
