"use client";

import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { ChallengeConfig } from "~/server/db/types";
import { EnvsForm } from "./envs-form";
import { PortsForm } from "./ports-form";

interface ContainerFormProps {
    containerIndex: number;
    remove: () => void;
}

export function ContainerForm({ containerIndex, remove }: ContainerFormProps) {
    const { control } = useFormContext<ChallengeConfig>();

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Container {containerIndex + 1}</CardTitle>
                    <Button type="button" variant="ghost" size="icon" onClick={remove}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={control}
                        name={`deploy.containers.${containerIndex}.name`}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={`deploy.containers.${containerIndex}.image`}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                <EnvsForm containerIndex={containerIndex} />

                <PortsForm containerIndex={containerIndex} />
            </CardContent>
        </Card>
    );
}
