"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export default function ThemedToast() {
    const { resolvedTheme } = useTheme();
    return <Toaster richColors theme={(resolvedTheme as "light" | "dark" | "system") ?? "system"} />;
}
