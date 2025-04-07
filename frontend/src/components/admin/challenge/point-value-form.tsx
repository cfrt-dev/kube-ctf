"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function PointValueForm() {
    const { control } = useFormContext();
    const valueType = useWatch({ control, name: "value.type" });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Point Value</CardTitle>
                <CardDescription>Configure how points are awarded for this challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name="value.type"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Value Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select value type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Static">Static</SelectItem>
                                    <SelectItem value="Dynamic">Dynamic</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="value.initialPoints"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Initial Value</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        </FormItem>
                    )}
                />

                {valueType === "Dynamic" && (
                    <div className="space-y-4 border rounded-md p-4">
                        <h4 className="font-medium">Decay Function</h4>

                        <FormField
                            control={control}
                            name="value.decayFunction.type"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Decay Type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange} defaultValue="linear">
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select decay type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="linear">Linear</SelectItem>
                                            <SelectItem value="logarithmic">Logarithmic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="value.decayFunction.decay"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Decay Rate</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="value.decayFunction.minimumValue"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Minimum Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
