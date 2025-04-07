"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MonacoEditor } from "./monaco-editor";

interface MonacoEditorLoaderProps<T> {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    height?: string | number;
    className?: string;
    schema?: T;
}

export function MonacoEditorLoader<T>(props: MonacoEditorLoaderProps<T>) {
    return <MonacoEditor {...props} />;
}
