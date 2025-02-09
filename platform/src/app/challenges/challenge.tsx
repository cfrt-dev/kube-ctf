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
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createInstance, deleteInstance } from "~/server/challenge/deploy";
import { Input } from "~/components/ui/input";
import ChallengeLink from "./challenge-link";
import { useToast } from "~/hooks/use-toast";
import type { Link } from "~/server/db/types";
import type { ChallengeInfo } from "../api/challenge/route";

interface ChallengeProps {
    id: number;
    name: string;
    author?: string;
    description?: string;
    hints?: string[];
    currentValue: number;
    type: "static" | "dynamic";
    files?: string[];
    links: Link[];
}

export default function ChallengeComponent(props: ChallengeProps) {
    const { toast } = useToast();
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [links, setLinks] = useState<Link[]>(props.links);
    const [instanceName, setInstanceName] = useState<string>("");

    const handleStartInstance = async () => {
        setIsLoading(true);

        const runningChallenge = await createInstance(props.id);
        setLinks(runningChallenge.links);
        setInstanceName(runningChallenge.id);

        setIsRunning(true);
        setIsLoading(false);
    };

    const handleStopInstance = async () => {
        await deleteInstance(instanceName);
        setIsRunning(false);
    };

    const handleCopyUrl = (url: string) => {
        void navigator.clipboard.writeText(url);
        toast({
            description: "URL copied to clipboard",
        });
    };

    useEffect(() => {
        if (dialogOpen === false) return;
        const fetchData = async () => {
            const response = await fetch(`/api/challenge?id=${props.id}`);
            const data = (await response.json()) as ChallengeInfo;

            setIsRunning(data.isRunning);
            if (data.isRunning) {
                setInstanceName(data.instanceName!);
                setLinks(data.links);
            }
        };
        fetchData().catch((error) => {
            console.error("Error fetching challenge info:", error);
        });
    }, [props.id, dialogOpen]);

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <DialogTrigger asChild className="w-72">
                <Card
                    className="cursor-pointer transitiona-all hover:bg-muted/50 h-[120px] flex flex-col
                        justify-center"
                >
                    <CardHeader className="text-center space-y-1 py-3">
                        <CardTitle className="text-2xl">{props.name}</CardTitle>
                        <div className="text-sm font-medium">
                            {props.currentValue} points
                        </div>
                    </CardHeader>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="text-center space-y-2">
                    <DialogTitle className="text-2xl font-bold">
                        {props.name}
                    </DialogTitle>
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-lg">
                            {props.currentValue} points
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {props.author && (
                            <Badge variant="outline">By @{props.author}</Badge>
                        )}
                        <Badge variant="default">Dynamic</Badge>
                    </div>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        {props.description}
                    </p>
                </div>
                {isRunning ? (
                    <>
                        <div className="space-y-2">
                            {links.map((link, index) => {
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
                        <div className="">{/* Time Remaining */}</div>
                        <div className="flex flex-col">
                            <Button
                                onClick={handleStopInstance}
                                variant="destructive"
                            >
                                Stop Instance
                            </Button>
                        </div>
                        <form className="space-y-4">
                            <Input placeholder="Enter flag here..."></Input>
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
