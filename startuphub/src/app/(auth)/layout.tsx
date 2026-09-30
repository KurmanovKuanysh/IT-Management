import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Вошедшему пользователю формы входа и регистрации не нужны.
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard");
  return <div className="flex justify-center py-8 sm:py-16">{children}</div>;
}
