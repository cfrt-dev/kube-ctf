"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface FilterContextType {
    showSolved: boolean;
    setShowSolved: (value: boolean) => void;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategories: string[];
    setSelectedCategories: (value: string[]) => void;
    updateUrl: () => void;
}

const FilterContext = createContext<FilterContextType>({
    showSolved: true,
    setShowSolved: () => {
        throw new Error("setShowSolved must be used within a FilterProvider");
    },
    searchQuery: "",
    setSearchQuery: () => {
        throw new Error("setSearchQuery must be used within a FilterProvider");
    },
    selectedCategories: [],
    setSelectedCategories: () => {
        throw new Error("setSelectedCategories must be used within a FilterProvider");
    },
    updateUrl: () => {
        throw new Error("updateUrl must be used within a FilterProvider");
    },
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const initialShowSolved = searchParams.get("showSolved") !== "false";
    const initialSearchQuery = searchParams.get("search") || "";
    const initialCategories = searchParams.get("categories") || "";

    const [showSolved, setShowSolved] = useState(initialShowSolved);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [selectedCategories, setSelectedCategories] = useState(initialCategories ? initialCategories.split(",") : []);

    const updateUrl = () => {
        const params = new URLSearchParams();

        if (searchQuery) params.set("search", searchQuery);
        else params.delete("search");

        if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
        else params.delete("categories");

        if (!showSolved) params.set("showSolved", "false");
        else params.delete("showSolved");

        window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const filterFromUrl = searchParams.get("search") || "";
        const categoriesFromUrl = searchParams.get("categories") || "";
        const showSolvedFromUrl = searchParams.get("showSolved") !== "false";

        setSearchQuery(filterFromUrl);
        setSelectedCategories(categoriesFromUrl ? categoriesFromUrl.split(",") : []);
        setShowSolved(showSolvedFromUrl);
    }, [searchParams]);

    return (
        <FilterContext.Provider
            value={{
                showSolved,
                setShowSolved,
                searchQuery,
                setSearchQuery,
                selectedCategories,
                setSelectedCategories,
                updateUrl,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    return useContext(FilterContext);
}
