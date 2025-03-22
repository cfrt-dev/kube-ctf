"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { ChallengeConfig } from "~/server/db/types";

interface PortsFormProps {
    containerIndex: number;
}

export function PortsForm({ containerIndex }: PortsFormProps) {
    const { control, setValue } = useFormContext<ChallengeConfig>();
    const ports = useWatch({ control, name: `deploy.containers.${containerIndex}.ports` }) || [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: `deploy.containers.${containerIndex}.ports`,
    });

    const addPort = () => {
        append({
            number: 80,
            protocol: "http",
            domain: "",
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Ports</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPort}>
                    <Plus className="mr-1 h-3 w-3" /> Add Port
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fields.map((field, portIndex) => (
                    <div key={field.id} className="p-2 border rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Port {portIndex + 1}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => remove(portIndex)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <FormField
                                control={control}
                                name={`deploy.containers.${containerIndex}.ports.${portIndex}.number`}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = Number.parseInt(e.target.value, 10);
                                                    field.onChange(Number.isNaN(value) ? 0 : value);
                                                }}
                                            />
                                        </FormControl>
                                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`deploy.containers.${containerIndex}.ports.${portIndex}.protocol`}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Protocol</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="http">HTTP</SelectItem>
                                                <SelectItem value="tcp">TCP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`deploy.containers.${containerIndex}.ports.${portIndex}.domain`}
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Domain (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value || ""}
                                                placeholder="Optional"
                                                size={1}
                                            />
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
