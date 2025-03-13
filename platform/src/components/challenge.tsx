"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { createInstance, deleteInstance } from "~/server/challenge/deploy";
import { getChallengeInfo } from "~/server/challenge/get";
import { submitFlag } from "~/server/challenge/submit";
import type { PublicChallengeInfo } from "~/server/db/types";
import ChallengeLink from "./challenge-link";

export default function ChallengeComponent(props: { initialChallenge: PublicChallengeInfo }) {
    const { initialChallenge } = props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [answer, setAnswer] = useState("");
    const queryClient = useQueryClient();

    const { data: challengeData } = useQuery({
        queryKey: ["challenge", initialChallenge.id],
        queryFn: () => getChallengeInfo(initialChallenge.id),
        initialData: initialChallenge,
        enabled: dialogOpen,
    });

    const challenge = challengeData ?? initialChallenge;

    const startInstanceMutation = useMutation({
        mutationFn: () => createInstance(initialChallenge.id),
        onSuccess: (data) => {
            queryClient.setQueryData(
                ["challenge", initialChallenge.id],
                (oldData: PublicChallengeInfo | undefined): PublicChallengeInfo => ({
                    ...(oldData ?? initialChallenge),
                    links: data!.links,
                    instanceName: data!.id,
                }),
            );
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
        mutationFn: ({ instanceName, flag }: { instanceName: string; flag: string }) => submitFlag(instanceName, flag),
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
            setDialogOpen(false);
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
        if (challenge.instanceName) {
            submitFlagMutation.mutate({ instanceName: challenge.instanceName, flag: answer });
        }
    };

    const handleCardClick = () => {
        setDialogOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild className="w-72">
                <Card
                    key={challenge.id}
                    onClick={handleCardClick}
                    className={cn(
                        "cursor-pointer transition-all hover:bg-muted/50 h-[160px] w-full",
                        challenge.isSolved &&
                            "bg-emerald-400/20 border-emerald-400/40 dark:bg-emerald-400/10 dark:border-emerald-400/30",
                    )}
                >
                    <CardHeader className="p-6 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg line-clamp-1">{challenge.name}</CardTitle>
                                <div
                                    className={cn(
                                        "font-medium text-base",
                                        challenge.isSolved && "text-emerald-500 dark:text-emerald-300",
                                    )}
                                >
                                    {challenge.currentValue}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {challenge.category}
                            </Badge>
                            {challenge.isSolved && (
                                <Badge variant="default" className="bg-emerald-500 text-xs">
                                    Solved
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] focus-visible:outline-hidden">
                <DialogHeader className="text-center space-y-2">
                    <DialogTitle className="text-2xl font-bold">{challenge.name}</DialogTitle>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-lg">{challenge.currentValue} points</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {challenge.author && <Badge variant="outline">By @{challenge.author}</Badge>}
                        <Badge variant="default">Dynamic</Badge>
                    </div>
                </DialogHeader>
                <DialogDescription>{challenge.description}</DialogDescription>
                {isRunning ? (
                    <>
                        <div className="space-y-2">
                            {challenge.links!.map((link, index) => (
                                <ChallengeLink
                                    key={index}
                                    url={{ url: link.url, protocol: link.protocol }}
                                    onCopy={() => handleCopyUrl(link.url)}
                                />
                            ))}
                        </div>
                        <div className=""></div>
                        <div className="flex flex-col">
                            <Button
                                onClick={() =>
                                    challenge.instanceName && stopInstanceMutation.mutate(challenge.instanceName)
                                }
                                variant="destructive"
                            >
                                {stopInstanceMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Stop Instance
                            </Button>
                        </div>
                        <form onSubmit={handleFlagSubmit} className="space-y-4">
                            <Input
                                id="answer"
                                value={answer}
                                placeholder="Enter flag here..."
                                onChange={(e) => setAnswer(e.target.value)}
                            ></Input>
                            <Button type="submit" className="w-full" disabled={submitFlagMutation.isLoading}>
                                {stopInstanceMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Flag
                            </Button>
                        </form>
                    </>
                ) : (
                    <Button onClick={() => startInstanceMutation.mutate()} variant="default">
                        {startInstanceMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Start Instance
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
}
