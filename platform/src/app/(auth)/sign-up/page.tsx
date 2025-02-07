"use client";

import { useRouter } from "next/navigation";
import { AuthForm } from "../../../components/form";
import { type RegisterFormData, registerSchema } from "./form";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = async (data: RegisterFormData) => {
        const response = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!response.redirected) {
            const message = (await response.json()) as { message: string };
            throw new Error(message.message);
        }

        router.push("/");
    };

    const registerFields = [
        {
            id: 1,
            name: "username",
            placeholder: "John Doe",
            description: "This is your public display name",
        },
        {
            id: 2,
            name: "email",
            placeholder: "john@example.com",
            description: "We'll never share your email with anyone else",
        },
        {
            id: 3,
            name: "password",
            description:
                "Must be at least 8 characters with uppercase, lowercase and numbers",
        },
    ];

    return (
        <AuthForm
            title="Register"
            fields={registerFields}
            schema={registerSchema}
            onSubmit={handleLogin}
            submitButtonText="Register"
            successMessage="Successful registration! Redirecting..."
        />
    );
}
