"use client";

import { Plus, RotateCcw, Search, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useFilter } from "./challenge-filter-context";

const categories = [
    { key: "web", name: "Web" },
    { key: "pwn", name: "Pwn" },
    { key: "crypto", name: "Crypto" },
    { key: "forensics", name: "Forensics" },
    { key: "misc", name: "Misc" },
];

export default function ChallengesFilter() {
    const {
        showSolved,
        setShowSolved,
        searchQuery,
        setSearchQuery,
        selectedCategories,
        setSelectedCategories,
        updateUrl,
    } = useFilter();

    useEffect(() => {
        const timer = setTimeout(() => {
            updateUrl();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        updateUrl();
    }, [selectedCategories, showSolved]);

    const handleCategoryReset = () => {
        setSelectedCategories([]);
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategories([category]);
    };

    const handleCategoryAdd = (e: React.MouseEvent, category: string) => {
        e.stopPropagation();
        setSelectedCategories(
            selectedCategories.includes(category)
                ? selectedCategories.filter((c) => c !== category)
                : [...selectedCategories, category],
        );
    };

    return (
        <>
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search challenges..."
                    className="pl-8 pr-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-2.5 h-5 w-5 rounded-full text-muted-foreground hover:text-foreground "
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch id="show-solved" checked={showSolved} onCheckedChange={setShowSolved} />
                    <Label htmlFor="show-solved">Show solved</Label>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Categories</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground"
                            onClick={handleCategoryReset}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid gap-2">
                        {categories.map((category) => (
                            <div key={category.key} className="flex gap-2">
                                <Button
                                    variant={selectedCategories.includes(category.key) ? "default" : "outline"}
                                    className="justify-start flex-1 h-10"
                                    onClick={() => handleCategoryClick(category.key)}
                                >
                                    {category.name}
                                </Button>
                                <Button
                                    variant={selectedCategories.includes(category.key) ? "default" : "outline"}
                                    className="h-10 w-10"
                                    onClick={(e) => handleCategoryAdd(e, category.key)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
