"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { ChallengeConfig } from "~/server/db/types";

interface EnvsFormProps {
    containerIndex: number;
}

export function EnvsForm({ containerIndex }: EnvsFormProps) {
    const { control } = useFormContext<ChallengeConfig>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: `deploy.containers.${containerIndex}.envs`,
    });

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Environment variables</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", value: "" })}>
                    <Plus className="mr-1 h-3 w-3" /> Add Env
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fields.map((field, envIndex) => (
                    <div key={field.id} className="p-2 border rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Env {envIndex + 1}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => remove(envIndex)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <FormField
                                control={control}
                                name={`deploy.containers.${containerIndex}.envs.${envIndex}.name`}
                                render={({ field: nameField, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Name</FormLabel>
                                        <FormControl>
                                            <Input {...nameField} />
                                        </FormControl>
                                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`deploy.containers.${containerIndex}.envs.${envIndex}.value`}
                                render={({ field: valueField, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Value</FormLabel>
                                        <FormControl>
                                            <Input {...valueField} />
                                        </FormControl>
                                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
