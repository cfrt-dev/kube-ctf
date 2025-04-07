"use client";

import { useRouter } from "next/navigation";
import { AuthForm } from "~/components/auth-form";
import { type LoginFormData, loginSchema } from "./form";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = async (data: LoginFormData) => {
        const response = await fetch("http://localhost:8000/api/accounts/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.redirected) {
            const message = (await response.json()) as { message: string };
            throw new Error(message.message);
        }

        router.push("/challenges");
    };

    const registerFields = [
        {
            id: 1,
            name: "email",
            placeholder: "john@example.com",
            description: "We'll never share your email with anyone else",
        },
        {
            id: 2,
            name: "password",
            description: "Must be at least 8 characters with uppercase, lowercase and numbers",
        },
    ];

    return (
        <AuthForm
            title="Login"
            fields={registerFields}
            schema={loginSchema}
            onSubmit={handleLogin}
            submitButtonText="Login"
            successMessage="Login successful! Redirecting..."
        />
    );
}
