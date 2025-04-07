"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import { cn } from "~/lib/utils";
import { createInstance, deleteInstance } from "~/server/challenge/deploy";
import { getChallengeInfo } from "~/server/challenge/get";
import type { PublicChallengeInfo } from "~/server/db/types";
import Challenge from "./challenge";
import { useFilter } from "./challenge-filter-context";
import { Badge } from "./ui/badge";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { DialogTrigger } from "./ui/dialog";

interface ChallengeListProps {
    challenges: PublicChallengeInfo[];
}

const queryClient = new QueryClient();

function ChallengeTriggerCard({ challenge, onClick }: { challenge: PublicChallengeInfo; onClick: () => void }) {
    return (
        <DialogTrigger asChild className="w-72">
            <Card
                key={challenge.id}
                onClick={onClick}
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
                                {challenge.value.points}
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
    );
}

export default function ChallengeList({ challenges }: ChallengeListProps) {
    const { showSolved, searchQuery, selectedCategories } = useFilter();

    const fuse = useMemo(
        () =>
            new Fuse(challenges, {
                keys: ["name", "description"],
                threshold: 0.4,
            }),
        [challenges],
    );

    const filteredChallenges = useMemo(() => {
        let filtered = challenges;

        if (searchQuery) {
            const searchResults = fuse.search(searchQuery);
            filtered = searchResults.map((result) => result.item);
        }

        if (selectedCategories.length > 0) {
            filtered = filtered.filter((challenge) => selectedCategories.includes(challenge.category));
        }

        if (!showSolved) {
            filtered = filtered.filter((challenge) => !challenge.isSolved);
        }

        return filtered;
    }, [challenges, searchQuery, selectedCategories, showSolved, fuse]);

    return (
        <QueryClientProvider client={queryClient}>
            {filteredChallenges
                .map((challenge) => ({ challenge, id: nanoid(7) }))
                .map(({ challenge, id }) => (
                    <Challenge
                        trigger={(updatedChallenge) => (
                            <ChallengeTriggerCard challenge={updatedChallenge} onClick={() => console.log("click")} />
                        )}
                        getInfo={getChallengeInfo}
                        key={id}
                        initialChallengeFunc={() => challenge}
                        createInstance={createInstance}
                        deleteInstance={deleteInstance}
                    />
                ))}
        </QueryClientProvider>
    );
}
