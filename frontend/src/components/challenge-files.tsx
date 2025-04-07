import { Download } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "~/components/ui/button";
import type { ChallengeFile } from "~/server/db/types";

interface ChallengeFilesProps {
    files: ChallengeFile[];
}

export function ChallengeFiles({ files }: ChallengeFilesProps) {
    if (!files || files.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {files
                .map((file) => ({ file, id: nanoid(7) }))
                .map(({ file, id }) => (
                    <Button
                        key={id}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="h-8"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {file.name}
                    </Button>
                ))}
        </div>
    );
}
