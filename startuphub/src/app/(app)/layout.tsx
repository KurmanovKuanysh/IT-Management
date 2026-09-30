import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Middleware проверяет только подпись токена; здесь — что пользователь
// всё ещё существует и не заблокирован.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await getCurrentUser())) redirect("/login");
  return children;
}
