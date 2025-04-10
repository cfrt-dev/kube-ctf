import { Copy, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import type { Link } from "~/server/db/types";

export default function ChallengeLink({ url, onCopy }: { url: Link; onCopy: () => void }) {
    return (
        <Alert>
            <AlertDescription className="flex items-center justify-between break-all">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-md shrink-0">{url.protocol}</span>
                    <span className="truncate">{url.url}</span>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                    {url.description && <span className="text-xs text-muted-foreground">{url.description}</span>}
                    {url.protocol === "http" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`http://${url.url}`, "_blank")}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
}
