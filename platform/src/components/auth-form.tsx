"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { type Path, useForm } from "react-hook-form";
import type { ZodSchema, z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { capitalize } from "~/lib/utils";

interface AuthFormProps<T extends z.ZodType> {
    title: string;
    fields: {
        id: number;
        name: string;
        placeholder?: string;
        description?: string;
    }[];
    schema: ZodSchema;
    onSubmit: (data: z.infer<T>) => Promise<void>;
    submitButtonText: string;
    successMessage: string;
}

export function AuthForm<T extends z.ZodType>({
    title,
    fields,
    schema,
    onSubmit,
    submitButtonText,
    successMessage,
}: AuthFormProps<T>) {
    const [loading, setLoading] = useState(false);
    const [formResponse, setFormResponse] = useState<{
        message: string;
        success?: boolean;
    } | null>(null);

    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        defaultValues: Object.fromEntries(fields.map((field) => [field.name, ""])) as z.infer<T>,
    });

    const handleSubmit = async (data: z.infer<T>) => {
        setLoading(true);
        setFormResponse(null);

        try {
            await onSubmit(data);
            setFormResponse({
                message: successMessage,
                success: true,
            });
        } catch (error) {
            setFormResponse({
                message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
                success: false,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <h1 className="flex-1 font-bold text-5xl text-center mt-40">{title}</h1>
            <Card className="w-full max-w-md mx-auto mt-12">
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {fields.map((form_field) => (
                                <FormField
                                    key={form_field.id}
                                    control={form.control}
                                    name={form_field.name as Path<z.infer<T>>}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{capitalize(form_field.name)}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type={form_field.name === "username" ? "text" : form_field.name}
                                                    placeholder={form_field.placeholder}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>{form_field.description}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}

                            {formResponse && (
                                <Alert variant={formResponse.success ? "default" : "destructive"}>
                                    <AlertDescription className="flex items-center gap-x-2">
                                        {formResponse.success ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                        {formResponse.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Loading..." : submitButtonText}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
