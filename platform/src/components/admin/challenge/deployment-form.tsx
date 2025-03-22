"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { ChallengeConfig } from "~/server/db/types";
import { ContainerForm } from "./container-form";

export function DeploymentForm() {
    const { control } = useFormContext<ChallengeConfig>();

    const {
        fields: secretFields,
        append: appendSecret,
        remove: removeSecret,
    } = useFieldArray({
        control,
        name: "deploy.imagePullSecrets",
    });

    const {
        fields: containerFields,
        append: appendContainer,
        remove,
    } = useFieldArray({
        control,
        name: "deploy.containers",
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Deployment</CardTitle>
                <CardDescription>Configure how the challenge is deployed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="deploy.type"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Deployment Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select deployment type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Dynamic">Dynamic</SelectItem>
                                    <SelectItem value="Static">Static</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Image Pull Secrets</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendSecret("")}>
                            <Plus className="mr-1 h-3 w-3" /> Add Secret
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {secretFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField
                                    control={control}
                                    name={`deploy.imagePullSecrets.${index}`}
                                    render={({ field: secretField }) => (
                                        <Input className="flex-1" placeholder="Secret name" {...secretField} />
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSecret(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Containers</Label>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                appendContainer({
                                    name: `container-${containerFields.length + 1}`,
                                    image: "nginx:latest",
                                    ports: [],
                                    envs: [],
                                })
                            }
                        >
                            <Plus className="mr-1 h-4 w-4" /> Add Container
                        </Button>
                    </div>

                    {containerFields.map((field, containerIndex) => (
                        <ContainerForm
                            key={field.id}
                            containerIndex={containerIndex}
                            remove={() => remove(containerIndex)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
