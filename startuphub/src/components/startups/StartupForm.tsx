"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Startup } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { Alert, Button, ButtonLink, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { ApiRequestError, apiFetch } from "@/lib/client-api";
import { INDUSTRY_LABELS, STAGE_LABELS } from "@/lib/constants";
import { startupSchema } from "@/lib/validation/startup";

type FieldName = keyof typeof startupSchema.shape;

const TEXT_FIELDS: {
  name: FieldName;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
}[] = [
  { name: "contactEmail", label: "Contact email *", type: "email", placeholder: "team@startup.com" },
  { name: "websiteUrl", label: "Website", type: "url", placeholder: "https://…" },
  { name: "pitchDeckUrl", label: "Pitch deck link", type: "url", placeholder: "https://…", hint: "Google Drive, Docsend, Canva…" },
  { name: "logoUrl", label: "Logo URL", type: "url", placeholder: "https://…/logo.png", hint: "A square image works best" },
  { name: "location", label: "Location", placeholder: "Almaty, KZ" },
  { name: "teamSize", label: "Team size", type: "number", placeholder: "3" },
  { name: "foundedYear", label: "Founded year", type: "number", placeholder: String(new Date().getFullYear()) },
];

function toFormValues(startup?: Startup): FieldValues {
  const values: FieldValues = {};
  for (const key of Object.keys(startupSchema.shape)) {
    const value = startup?.[key as FieldName];
    values[key] = value == null ? "" : String(value);
  }
  return values;
}

export function StartupForm({ startup }: { startup?: Startup }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const isEdit = !!startup;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    // preprocess-поля схемы принимают unknown — поэтому форма типизирована общим FieldValues.
    resolver: zodResolver(startupSchema) as unknown as Resolver<FieldValues>,
    defaultValues: toFormValues(startup),
  });

  const err = (name: FieldName) => errors[name]?.message as string | undefined;
  const aria = (name: FieldName) => ({
    id: name,
    "aria-invalid": !!err(name),
    "aria-describedby": err(name) ? `${name}-error` : undefined,
    ...register(name),
  });

  async function onSubmit(values: FieldValues) {
    setFormError(null);
    try {
      const { startup: saved } = await apiFetch<{ startup: Startup }>(
        isEdit ? `/api/startups/${startup.id}` : "/api/startups",
        { method: isEdit ? "PATCH" : "POST", body: values },
      );
      router.push(isEdit ? `/startups/${saved.slug}` : "/dashboard?created=1");
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {formError && <Alert>{formError}</Alert>}

      <Card className="flex flex-col gap-5 p-6">
        <h2 className="font-semibold text-fg">About the startup</h2>
        <Field label="Name *" htmlFor="name" error={err("name")}>
          <Input placeholder="EcoRide" {...aria("name")} />
        </Field>
        <Field label="Tagline *" htmlFor="tagline" error={err("tagline")} hint="One sentence, up to 140 characters">
          <Input placeholder="Shared e-scooters for university campuses" {...aria("tagline")} />
        </Field>
        <Field
          label="Description *"
          htmlFor="description"
          error={err("description")}
          hint="The problem, your solution, who it is for and what you need (50–5000 characters)"
        >
          <Textarea rows={8} {...aria("description")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Industry *" htmlFor="industry" error={err("industry")}>
            <Select {...aria("industry")}>
              <option value="">Choose…</option>
              {Object.entries(INDUSTRY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Stage *" htmlFor="stage" error={err("stage")}>
            <Select {...aria("stage")}>
              <option value="">Choose…</option>
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <h2 className="font-semibold text-fg">Contacts and details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <Field key={f.name} label={f.label} htmlFor={f.name} error={err(f.name)} hint={f.hint}>
              <Input type={f.type ?? "text"} placeholder={f.placeholder} {...aria(f.name)} />
            </Field>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ButtonLink href={isEdit ? `/startups/${startup.slug}` : "/dashboard"} variant="ghost">
          Cancel
        </ButtonLink>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes" : "Save as draft"}
        </Button>
      </div>
    </form>
  );
}
