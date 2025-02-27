"use client";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createInstance, deleteInstance } from "~/server/challenge/deploy";
import { Input } from "~/components/ui/input";
import type { ChallengeInfo } from "../app/api/challenge/route";
import { DialogDescription } from "@radix-ui/react-dialog";
import { submitFlag } from "~/server/challenge/submit";
import type { PublicChallengeInfo } from "~/server/db/types";
import ChallengeLink from "./challenge-link";
import { cn } from "~/lib/utils";

export default function ChallengeComponent(props: {
    initialChallenge: PublicChallengeInfo;
}) {
    const { initialChallenge } = props;
    const [challenge, setChallenge] = useState(initialChallenge);
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [answer, setAnswer] = useState("");

    const handleStartInstance = async () => {
        setIsLoading(true);

        const runningChallenge = await createInstance(initialChallenge.id);
        setChallenge({
            ...challenge,
            links: runningChallenge!.links,
            instanceName: runningChallenge!.id,
        });
        setIsRunning(true);
        setIsLoading(false);
    };

    const handleStopInstance = async () => {
        void deleteInstance(challenge.instanceName!);
        setIsRunning(false);
        setAnswer("");
    };

    const handleFlagSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const result = await submitFlag(challenge.instanceName!, answer);
        if (!result) {
            toast.error("Wrong flag");
            return;
        }

        toast.success("Correct flag");
        setIsRunning(false);
        setChallenge({
            ...challenge,
            isSolved: true,
        });
        setAnswer("");
        setDialogOpen(false);
    };

    const handleCopyUrl = (url: string) => {
        void navigator.clipboard.writeText(url);
        toast("URL copied to clipboard");
    };

    useEffect(() => {
        if (window.location.hash === `#${challenge.id}`) {
            setDialogOpen(true);
        }
    }, [challenge.id]);

    useEffect(() => {
        if (dialogOpen === false) return;

        const fetchData = async () => {
            const { isRunning, instanceName, links, startTime } = await fetch(
                `/api/challenge?id=${challenge.id}`,
            )
                .then((response) => response.json())
                .then((response) => response as ChallengeInfo);

            setIsRunning(isRunning);
            if (isRunning) {
                setChallenge({
                    ...challenge,
                    instanceName: instanceName!,
                    links: links!,
                    startTime: startTime,
                });
            }
        };

        fetchData().catch((error) => {
            console.error("Error fetching challenge info:", error);
        });
    }, [dialogOpen]);

    const handleCardClick = () => {
        window.location.hash = challenge.id.toString();
        setDialogOpen(true);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            history.replaceState(null, "", window.location.pathname);
        }
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
                            `bg-emerald-400/20 border-emerald-400/40 dark:bg-emerald-400/10
                            dark:border-emerald-400/30`,
                    )}
                >
                    <CardHeader className="p-6 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg line-clamp-1">
                                    {challenge.name}
                                </CardTitle>
                                <div
                                    className={cn(
                                        "font-medium text-base",
                                        challenge.isSolved &&
                                            "text-emerald-500 dark:text-emerald-300",
                                    )}
                                >
                                    {challenge.currentValue}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {challenge.description}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {challenge.category}
                            </Badge>
                            {challenge.isSolved && (
                                <Badge
                                    variant="default"
                                    className="bg-emerald-500 text-xs"
                                >
                                    Solved
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] focus-visible:outline-hidden">
                <DialogHeader className="text-center space-y-2">
                    <DialogTitle className="text-2xl font-bold">
                        {challenge.name}
                    </DialogTitle>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-lg">
                            {challenge.currentValue} points
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {challenge.author && (
                            <Badge variant="outline">
                                By @{challenge.author}
                            </Badge>
                        )}
                        <Badge variant="default">Dynamic</Badge>
                    </div>
                </DialogHeader>
                <DialogDescription>{challenge.description}</DialogDescription>
                {isRunning ? (
                    <>
                        <div className="space-y-2">
                            {challenge.links!.map((link, index) => {
                                return (
                                    <ChallengeLink
                                        key={index}
                                        url={{
                                            url: link.url,
                                            protocol: link.protocol,
                                        }}
                                        onCopy={() => handleCopyUrl(link.url)}
                                    />
                                );
                            })}
                        </div>
                        <div className=""></div>
                        <div className="flex flex-col">
                            <Button
                                onClick={handleStopInstance}
                                variant="destructive"
                            >
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
                            <Button type="submit" className="w-full">
                                Submit Flag
                            </Button>
                        </form>
                    </>
                ) : (
                    <Button onClick={handleStartInstance} variant="default">
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Start Instance
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
}
