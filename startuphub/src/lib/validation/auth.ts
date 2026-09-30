import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(50, "At most 50 characters"),
  email,
  password: z.string().min(8, "At least 8 characters").max(72, "At most 72 characters"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
