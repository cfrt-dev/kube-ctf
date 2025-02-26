"use client";

import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Plus, Search } from "lucide-react";
import Challenge from "~/components/challenge";
import { challengeMock } from "./data";

function RenderChallenges() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1].map((value) => (
                <Challenge
                    key={value}
                    id={challengeMock.id}
                    name={challengeMock.name}
                    author={challengeMock.author}
                    description={challengeMock.description}
                    category={challengeMock.category}
                    hints={challengeMock.hints}
                    currentValue={challengeMock.value.currentValue}
                    type={challengeMock.deploy.type}
                    files={challengeMock.files}
                    isSolved={false}
                />
            ))}
        </div>
    );
}

const categories = [
    { value: "web", label: "Web" },
    { value: "pwn", label: "Pwn" },
    { value: "crypto", label: "Crypto" },
    { value: "forensics", label: "Forensics" },
    { value: "misc", label: "Misc" },
];

export default function ChallengesPage() {
    return (
        <div className="container py-8 mx-auto">
            <div className="flex gap-8">
                <div className="w-64 shrink-0 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search challenges..."
                            className="pl-8"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="show-solved" />
                            <Label htmlFor="show-solved">Show solved</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <div className="grid gap-2">
                                {categories.map((category) => (
                                    <div key={category.value} className="flex">
                                        <Button
                                            className="justify-start rounded-r-none border-r-2 w-full"
                                            variant={"outline"}
                                        >
                                            {category.label}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-l-none"
                                        >
                                            <Plus />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <h1 className="text-3xl font-bold">Challenges</h1>
                    <RenderChallenges />
                </div>
            </div>
        </div>
    );
}
