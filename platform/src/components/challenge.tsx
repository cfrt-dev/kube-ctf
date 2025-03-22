"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { type FormEvent, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { submitFlag } from "~/server/challenge/submit";
import type { Link, PublicChallengeInfo } from "~/server/db/types";
import { ChallengeFiles } from "./challenge-files";
import ChallengeLink from "./challenge-link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ChallengeComponentProps {
    initialChallengeFunc: () => PublicChallengeInfo;
    getInfo: (id: number) => Promise<PublicChallengeInfo | null>;
    createInstance: (id: number) => Promise<
        | {
              links: Link[];
              id: string;
              start_time: Date;
          }
        | undefined
    >;
    deleteInstance: (id: string) => Promise<void>;
    trigger: (challenge: PublicChallengeInfo) => React.ReactNode;
}

export function DescriptionMarkdown({ markdown }: { markdown: string }) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline && match ? (
                        <SyntaxHighlighter style={gruvboxDark} PreTag="div" language={match[1]} {...props}>
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {markdown}
        </Markdown>
    );
}

export default function ChallengeComponent(props: ChallengeComponentProps) {
    const { initialChallengeFunc, getInfo, trigger, createInstance, deleteInstance } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [answer, setAnswer] = useState("");
    const queryClient = useQueryClient();
    const initialChallenge = initialChallengeFunc();

    const { data: challengeData, error } = useQuery({
        queryKey: ["challenge", initialChallenge.id],
        queryFn: () => getInfo(initialChallenge.id),
        initialData: initialChallenge,
        enabled: dialogOpen,
    });

    const challenge = challengeData ?? initialChallenge;

    const startInstanceMutation = useMutation({
        mutationFn: () => createInstance(initialChallenge.id),
        onSuccess: (data) => {
            queryClient.setQueryData(["challenge", initialChallenge.id], (oldData: PublicChallengeInfo | undefined) => {
                if (data !== undefined) {
                    return {
                        ...(oldData ?? initialChallenge),
                        links: data.links,
                        instanceName: data.id,
                    };
                }
            });
            setAnswer("");
        },
        onError: () => toast.error("Failed to start instance"),
    });

    const stopInstanceMutation = useMutation({
        mutationFn: (instanceName: string) => deleteInstance(instanceName),
        onSuccess: () => {
            queryClient.setQueryData(
                ["challenge", initialChallenge.id],
                (oldData: PublicChallengeInfo | undefined): PublicChallengeInfo => ({
                    ...(oldData ?? initialChallenge),
                    links: null,
                    instanceName: undefined,
                }),
            );
            setAnswer("");
        },
        onError: () => toast.error("Failed to stop instance"),
    });

    const submitFlagMutation = useMutation({
        mutationFn: ({ instanceName, flag }: { instanceName: string | undefined; flag: string }) =>
            submitFlag(challenge.id, instanceName, flag),
        onSuccess: (result) => {
            if (!result) {
                toast.error("Wrong flag");
                return;
            }

            toast.success("Correct flag");
            queryClient.setQueryData(
                ["challenge", initialChallenge.id],
                (oldData: PublicChallengeInfo | undefined): PublicChallengeInfo => ({
                    ...(oldData ?? initialChallenge),
                    isSolved: true,
                    links: null,
                    instanceName: undefined,
                }),
            );
            setAnswer("");
        },
        onError: () => toast.error("Failed to submit flag"),
    });

    const isRunning = !!challenge.instanceName;

    const handleCopyUrl = (url: string) => {
        void navigator.clipboard.writeText(url);
        toast("URL copied to clipboard");
    };

    const handleFlagSubmit = (e: FormEvent) => {
        e.preventDefault();
        submitFlagMutation.mutate({ instanceName: challenge.instanceName, flag: answer });
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            {trigger(challenge)}
            <DialogContent
                className="sm:max-w-[600px] focus-visible:outline-hidden overflow-y-auto max-h-screen"
                aria-describedby={undefined}
            >
                {error ? (
                    <div className="py-8">
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="text-center space-y-2">
                            <DialogTitle className="text-2xl font-bold">{challenge.name}</DialogTitle>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-lg">
                                    {challenge.value.points || challenge.value.initialPoints} points
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {challenge.author && <Badge variant="outline">By @{challenge.author}</Badge>}
                            </div>
                        </DialogHeader>

                        <DescriptionMarkdown markdown={challenge.description ?? ""} />

                        {challenge.files && challenge.files.length > 0 && <ChallengeFiles files={challenge.files} />}

                        {challenge.links && (
                            <div className="space-y-2">
                                {challenge.links
                                    .map((link) => ({ link, id: nanoid(7) }))
                                    .map(({ link, id }) => (
                                        <ChallengeLink
                                            key={id}
                                            url={{ url: link.url, protocol: link.protocol }}
                                            onCopy={() => handleCopyUrl(link.url)}
                                        />
                                    ))}
                            </div>
                        )}

                        {challenge.isSolved ? (
                            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 justify-center">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>You've already solved this challenge!</span>
                                </div>
                            </div>
                        ) : challenge.deployType === "Static" ? (
                            <form onSubmit={handleFlagSubmit} className="space-y-4">
                                <Input
                                    id="answer"
                                    value={answer}
                                    placeholder="Enter flag here..."
                                    onChange={(e) => setAnswer(e.target.value)}
                                />

                                <Button type="submit" className="w-full" disabled={submitFlagMutation.isPending}>
                                    {stopInstanceMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Submit Flag
                                </Button>
                            </form>
                        ) : isRunning ? (
                            <>
                                <div className="flex flex-col">
                                    <Button
                                        onClick={() =>
                                            challenge.instanceName &&
                                            stopInstanceMutation.mutate(challenge.instanceName)
                                        }
                                        variant="destructive"
                                    >
                                        {stopInstanceMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Stop Instance
                                    </Button>
                                </div>

                                <form onSubmit={handleFlagSubmit} className="space-y-4">
                                    <Input
                                        id="answer"
                                        value={answer}
                                        placeholder="Enter flag here..."
                                        onChange={(e) => setAnswer(e.target.value)}
                                    />
                                    <Button type="submit" className="w-full" disabled={submitFlagMutation.isPending}>
                                        {stopInstanceMutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Submit Flag
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <Button onClick={() => startInstanceMutation.mutate()} variant="default">
                                {startInstanceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Instance
                            </Button>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
