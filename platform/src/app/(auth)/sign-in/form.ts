import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter",
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter",
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least one number",
        }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
