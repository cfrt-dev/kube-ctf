"use client";

import type React from "react";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { ChallengeConfig, Container } from "~/server/db/types";

interface EnvsFormProps {
    container: Container;
    containerIndex: number;
    config: ChallengeConfig;
    setConfig: React.Dispatch<React.SetStateAction<ChallengeConfig>>;
}

export function EnvsForm({ container, containerIndex, config, setConfig }: EnvsFormProps) {
    const addEnv = (containerIndex: number) => {
        const newContainers = [...config.deploy.containers];
        const container = newContainers[containerIndex]!;

        const newEnv = {
            name: "",
            value: "",
        };

        newContainers[containerIndex] = {
            ...container,
            envs: [...(container.envs || []), newEnv],
        };

        setConfig({
            ...config,
            deploy: {
                ...config.deploy,
                containers: newContainers,
            },
        });
    };

    const removeEnv = (containerIndex: number, envIndex: number) => {
        const newContainers = [...config.deploy.containers];
        const container = newContainers[containerIndex]!;
        const newEnvs = [...(container.envs || [])];

        newEnvs.splice(envIndex, 1);

        newContainers[containerIndex] = {
            ...container,
            envs: newEnvs,
        };

        setConfig({
            ...config,
            deploy: {
                ...config.deploy,
                containers: newContainers,
            },
        });
    };

    const updateEnv = (containerIndex: number, envIndex: number, name: string, value: string) => {
        const newContainers = [...config.deploy.containers];
        const container = newContainers[containerIndex]!;
        const newEnvs = [...(container.envs || [])];

        newEnvs[envIndex] = { name, value };

        newContainers[containerIndex] = {
            ...container,
            envs: newEnvs,
        };

        setConfig({
            ...config,
            deploy: {
                ...config.deploy,
                containers: newContainers,
            },
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Environment variables</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => addEnv(containerIndex)}>
                    <Plus className="mr-1 h-3 w-3" /> Add Env
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {container.envs?.map((env, envIndex) => (
                    <div key={envIndex} className="p-2 border rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Env {envIndex + 1}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeEnv(containerIndex, envIndex)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <div className="grid gap-1">
                                <Label className="text-xs">Name</Label>
                                <Input
                                    value={env.name}
                                    onChange={(e) => updateEnv(containerIndex, envIndex, e.target.value, env.value)}
                                    size={1}
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">Value</Label>
                                <Input
                                    value={env.value}
                                    onChange={(e) => updateEnv(containerIndex, envIndex, env.name, e.target.value)}
                                    size={1}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
