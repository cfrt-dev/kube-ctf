"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    height?: string | number;
    className?: string;
}

export function MonacoEditor({ value, onChange, language = "yaml", height = "600px", className }: MonacoEditorProps) {
    const { theme } = useTheme();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        monaco.languages;

        editor.focus();
    };

    useEffect(() => {
        if (!monacoRef.current) return;

        const editorTheme = theme === "dark" ? "vs-dark" : "vs";

        monacoRef.current.editor.setTheme(editorTheme);
    }, [theme]);

    return (
        <div className={className}>
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={(value) => onChange(value || "")}
                theme={theme === "dark" ? "vs-dark" : "vs"}
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    tabSize: 2,
                    wordWrap: "on",
                    automaticLayout: true,
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    );
}
