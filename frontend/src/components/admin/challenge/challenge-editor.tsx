"use client";

import type React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import yaml from "js-yaml";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { BasicInformationForm } from "~/components/admin/challenge/basic-information-form";
import { DeploymentForm } from "~/components/admin/challenge/deployment-form";
import { PointValueForm } from "~/components/admin/challenge/point-value-form";
import ChallengeComponent from "~/components/challenge";
import { MonacoEditor } from "~/components/monaco-editor";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { DialogTrigger } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { generateContainerLinks, generateRandomString } from "~/lib/utils";
import { type ChallengeFormValues, challengeSchema } from "~/lib/validators/challenge-schema";
import { EditChallenge } from "~/server/admin/challenges/edit";
import { createChallenge } from "~/server/challenge/create";
import type { ChallengeConfig } from "~/server/db/types";

interface ChallengeEditorProps {
    initialConfig: ChallengeConfig;
    challengeId: string;
}

const queryClient = new QueryClient();

export function ChallengeEditor({ initialConfig, challengeId }: ChallengeEditorProps) {
    const router = useRouter();
    const [yamlContent, setYamlContent] = useState(yaml.dump(initialConfig));
    const [activeTab, setActiveTab] = useState("form");
    const [yamlError, setYamlError] = useState<string | null>(null);
    const [showDeployment, setShowDeployment] = useState(initialConfig.deploy !== undefined);

    const methods = useForm<ChallengeFormValues>({
        resolver: zodResolver(challengeSchema),
        defaultValues: initialConfig as ChallengeFormValues,
        mode: "onBlur",
    });

    const {
        watch,
        handleSubmit,
        formState: { errors },
    } = methods;

    const onSubmit = async (data: ChallengeFormValues) => {
        if (challengeId === "new") {
            createChallenge(data as ChallengeConfig);
            router.push("/admin/challenges");
        } else {
            EditChallenge(data as ChallengeConfig, challengeId);
        }

        toast.success("Challenge updated successfully");
    };

    const handleYamlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setYamlError(null);
            const parsedConfig = yaml.load(yamlContent) as ChallengeConfig;

            const result = challengeSchema.safeParse(parsedConfig);

            if (!result.success) {
                setYamlError(result.error.message);
                toast.error("The YAML configuration contains errors");
                return;
            }

            console.log("Submitting YAML config:", parsedConfig);
            toast.success("Challenge updated successfully");
        } catch (error) {
            setYamlError("Invalid YAML format");
            toast.error("Invalid YAML configuration");
        }
    };

    const handleTabChange = (value: string) => {
        if (value === "form" && activeTab === "yaml") {
            try {
                setYamlError(null);
                const parsedConfig = yaml.load(yamlContent) as ChallengeConfig;

                const result = challengeSchema.safeParse(parsedConfig);

                if (!result.success) {
                    setYamlError(result.error.message);
                    toast.error("The YAML configuration contains errors. Form may not reflect all changes.");
                } else {
                    Object.keys(parsedConfig).forEach((key) => {
                        methods.setValue(key as any, (parsedConfig as any)[key]);
                    });

                    setShowDeployment(!!parsedConfig.deploy);
                }
            } catch (error) {
                setYamlError("Invalid YAML format");
                toast.error("Invalid YAML configuration. Form may not reflect all changes.");
            }
        } else if (value === "yaml" && activeTab === "form") {
            const formValues = methods.getValues();
            setYamlContent(yaml.dump(formValues));
        }

        setActiveTab(value);
    };

    const toggleDeployment = () => {
        setShowDeployment(!showDeployment);

        if (!showDeployment) {
            if (!methods.getValues("deploy")) {
                methods.setValue("deploy", {
                    type: "Static",
                    imagePullSecrets: [],
                    containers: [
                        {
                            name: "",
                            image: "nginx:latest",
                            envs: [],
                            ports: [],
                        },
                    ],
                });
            }
        } else {
            methods.setValue("deploy", undefined);
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length === 0) {
            return;
        }
        toast.error("Please fix the errors in the form before submitting");
    }, [errors]);

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-between mx-4">
                <TabsList>
                    <TabsTrigger value="form">Form</TabsTrigger>
                    <TabsTrigger value="yaml">YAML</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                    <QueryClientProvider client={queryClient}>
                        <ChallengeComponent
                            createInstance={async (id: number) => {
                                const name = generateRandomString(8);
                                const challenge = watch();
                                const res = {
                                    id: id.toString(),
                                    start_time: new Date(),
                                    links: generateContainerLinks(challenge.deploy, name),
                                };

                                console.log(res);
                                return res;
                            }}
                            deleteInstance={async (_) => {
                                return;
                            }}
                            initialChallengeFunc={() => {
                                const challenge = watch();
                                return {
                                    ...challenge,
                                    id: 1,
                                    links: [],
                                    hints: challenge.hints ?? [],
                                    files: challenge.files ?? [],
                                    isSolved: false,
                                    value: challenge.value,
                                    deployType: challenge.deploy?.type,
                                };
                            }}
                            getInfo={() => watch()}
                            trigger={() => (
                                <DialogTrigger asChild>
                                    <Button variant="outline">Preview</Button>
                                </DialogTrigger>
                            )}
                        />
                    </QueryClientProvider>
                    <Button variant="outline" onClick={() => router.back()}>
                        Back
                    </Button>
                </div>
            </div>

            <TabsContent value="form">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mx-4">
                        <BasicInformationForm />
                        <PointValueForm />

                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Deployment Configuration</h3>
                            <Button type="button" variant="outline" onClick={toggleDeployment}>
                                {showDeployment ? "Remove Deployment" : "Add Deployment"}
                            </Button>
                        </div>

                        {showDeployment && <DeploymentForm />}

                        <div className="flex justify-center md:justify-start lg:justify-start">
                            <Button type="submit" size="lg">
                                Save Challenge
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </TabsContent>

            <TabsContent value="yaml">
                <Card className="mx-auto border-none">
                    <CardContent className="pt-6">
                        <form onSubmit={handleYamlSubmit} className="space-y-4">
                            {yamlError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>YAML Validation Error</AlertTitle>
                                    <AlertDescription>{yamlError}</AlertDescription>
                                </Alert>
                            )}

                            <MonacoEditor
                                className="font-mono"
                                value={yamlContent}
                                onChange={setYamlContent}
                                language="yaml"
                                height="600px"
                            />
                            <Button type="submit">Save Changes</Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
