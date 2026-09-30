"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { Alert, Button, Card, Field, Input, Textarea } from "@/components/ui";
import { ApiRequestError, apiFetch } from "@/lib/client-api";
import { profileSchema } from "@/lib/validation/startup";

type Profile = { name: string; bio: string | null; avatarUrl: string | null };

export function ProfileForm({ user }: { user: Profile }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<FieldValues>,
    defaultValues: { name: user.name, bio: user.bio ?? "", avatarUrl: user.avatarUrl ?? "" },
  });

  async function onSubmit(values: FieldValues) {
    setMessage(null);
    try {
      await apiFetch("/api/users/me", { method: "PATCH", body: values });
      setMessage({ ok: true, text: "Profile saved" });
      router.refresh();
    } catch (e) {
      if (e instanceof ApiRequestError && Object.keys(e.fields).length > 0) {
        for (const [field, text] of Object.entries(e.fields)) setError(field, { message: text });
      } else {
        setMessage({ ok: false, text: e instanceof Error ? e.message : "Something went wrong" });
      }
    }
  }

  const err = (name: string) => errors[name]?.message as string | undefined;

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {message &&
          (message.ok ? (
            <p role="status" className="text-sm text-success">
              {message.text}
            </p>
          ) : (
            <Alert>{message.text}</Alert>
          ))}
        <Field label="Full name" htmlFor="name" error={err("name")}>
          <Input id="name" aria-invalid={!!err("name")} {...register("name")} />
        </Field>
        <Field label="Short bio" htmlFor="bio" error={err("bio")} hint="Up to 300 characters, shown on your startup pages">
          <Textarea id="bio" rows={4} aria-invalid={!!err("bio")} {...register("bio")} />
        </Field>
        <Field label="Avatar URL" htmlFor="avatarUrl" error={err("avatarUrl")}>
          <Input id="avatarUrl" type="url" placeholder="https://…" aria-invalid={!!err("avatarUrl")} {...register("avatarUrl")} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
