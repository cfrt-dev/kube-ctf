"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { FilesForm } from "./files-form";

export function BasicInformationForm() {
    const [newHint, setNewHint] = useState("");
    const { control, setValue } = useFormContext();
    const hints = useWatch({ control, name: "hints" });

    const addHint = () => {
        if (newHint.trim()) {
            setValue("hints", [...hints, newHint.trim()]);
            setNewHint("");
        }
    };

    const removeHint = (index: number) => {
        const newHints = [...hints];
        newHints.splice(index, 1);
        setValue("hints", newHints);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between">
                <div className="grid gap-2">
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>General information about the challenge</CardDescription>
                </div>

                <div className="flex gap-4">
                    <FormField
                        control={control}
                        name="hidden"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Hidden</FormLabel>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="dynamicFlag"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Dynamic Flag</FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-flow-col gap-4">
                    <div className="flex flex-col gap-4 h-full">
                        <FormField
                            control={control}
                            name="name"
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
                            name="author"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Author</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="category"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <FormField
                            control={control}
                            name="flag"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Flag</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <Label>Hints</Label>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a hint..."
                                    value={newHint}
                                    onChange={(e) => setNewHint(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addHint();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={addHint}>
                                    Add
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {hints.map((hint: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1.5">
                                        {hint}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-full"
                                            onClick={() => removeHint(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <FormField
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col gap-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} rows={8} className="overflow-scroll resize-none h-full" />
                                </FormControl>
                                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                            </FormItem>
                        )}
                    />
                </div>

                <FilesForm />
            </CardContent>
        </Card>
    );
}
