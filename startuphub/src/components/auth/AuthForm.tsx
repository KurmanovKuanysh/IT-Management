"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { Alert, Button, Card, Field, Input } from "@/components/ui";
import { ApiRequestError, apiFetch, safeNext } from "@/lib/client-api";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

const MODES = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to manage your startups.",
    submit: "Log in",
    endpoint: "/api/auth/login",
    schema: loginSchema,
    fields: [
      { name: "email", label: "Email", type: "email", autoComplete: "email" },
      { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
    ],
    footer: { text: "No account yet?", href: "/register", link: "Sign up" },
  },
  register: {
    title: "Create your account",
    subtitle: "Publish your startup and get discovered.",
    submit: "Sign up",
    endpoint: "/api/auth/register",
    schema: registerSchema,
    fields: [
      { name: "name", label: "Full name", type: "text", autoComplete: "name" },
      { name: "email", label: "Email", type: "email", autoComplete: "email" },
      { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
    ],
    footer: { text: "Already have an account?", href: "/login", link: "Log in" },
  },
};

export function AuthForm({ mode }: { mode: keyof typeof MODES }) {
  const config = MODES[mode];
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    // Две схемы с разными полями — одна форма, поэтому тип значений общий.
    resolver: zodResolver(config.schema) as unknown as Resolver<FieldValues>,
  });

  async function onSubmit(values: FieldValues) {
    setFormError(null);
    try {
      await apiFetch(config.endpoint, { method: "POST", body: values });
      router.push(next);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiRequestError && Object.keys(e.fields).length > 0) {
        for (const [field, message] of Object.entries(e.fields)) setError(field, { message });
      } else {
        setFormError(e instanceof Error ? e.message : "Something went wrong");
      }
    }
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-fg">{config.title}</h1>
      <p className="mt-1 text-sm text-muted">{config.subtitle}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        {formError && <Alert>{formError}</Alert>}
        {config.fields.map((f) => {
          const error = errors[f.name]?.message as string | undefined;
          return (
            <Field key={f.name} label={f.label} htmlFor={f.name} error={error}>
              <Input
                id={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${f.name}-error` : undefined}
                {...register(f.name)}
              />
            </Field>
          );
        })}
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          {config.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {config.footer.text}{" "}
        <Link href={config.footer.href} className="font-medium text-primary hover:underline">
          {config.footer.link}
        </Link>
      </p>
    </Card>
  );
}
