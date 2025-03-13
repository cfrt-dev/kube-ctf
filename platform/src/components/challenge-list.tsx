"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { useMemo } from "react";
import type { PublicChallengeInfo } from "~/server/db/types";
import Challenge from "./challenge";
import { useFilter } from "./challenge-filter-context";

interface ChallengeListProps {
    challenges: PublicChallengeInfo[];
}

const queryClient = new QueryClient();

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
            {filteredChallenges.map((challenge, index) => (
                <Challenge key={index} initialChallenge={challenge} />
            ))}
        </QueryClientProvider>
    );
}
