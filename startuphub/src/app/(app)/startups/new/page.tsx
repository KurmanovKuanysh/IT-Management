import type { Metadata } from "next";
import { StartupForm } from "@/components/startups/StartupForm";

export const metadata: Metadata = { title: "New startup" };

export default function NewStartupPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">New startup</h1>
        <p className="text-sm text-muted">
          It will be saved as a draft. You can publish it from your dashboard when it is ready.
        </p>
      </div>
      <StartupForm />
    </div>
  );
}
