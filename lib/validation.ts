import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000, "Message too long"),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(4000),
  })).max(20).optional(),
});

export const interviewSchema = z.object({
  role: z.string().min(1, "Role is required").max(100, "Role too long"),
  resumeId: z.string().cuid().optional(),
});

export const stripeCheckoutSchema = z.object({
  priceId: z.string().optional(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessage = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
    return { success: false, error: errorMessage };
  }
  return { success: true, data: result.data };
}