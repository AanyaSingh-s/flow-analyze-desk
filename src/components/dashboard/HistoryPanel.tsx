import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUploadHistory } from "@/contexts/UploadHistoryContext";
import { Trash2, Eye, PauseOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const HistoryPanel = () => {
  const { history, selectedId, selectRecord, removeRecord, clearHistory, paused } = useUploadHistory();

  const emptyMessage = useMemo(() => {
    if (paused) {
      return "History recording is paused. Resume to capture new uploads.";
    }
    return "Upload CSV files to build your history. Recent uploads will appear here.";
  }, [paused]);

  return (
    <Card className="border-border/50 bg-background/80 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center space-y-3">
            Upload history
            {paused ? <Badge variant="destructive">Paused</Badge> : null}
          </CardTitle>
          <CardDescription className="text-muted-foreground gap-3 ">Revisit previous CSV uploads and restore their data.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={history.length === 0} onClick={() => clearHistory()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <PauseOctagon className="h-8 w-8 text-muted-foreground/70" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[24rem]">
            <ul className="divide-y divide-border/60">
              {history.map((item) => {
                const uploadedAt = new Date(item.uploadedAt);
                const formatted = isNaN(uploadedAt.getTime())
                  ? item.uploadedAt
                  : uploadedAt.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:justify-between",
                      selectedId === item.id ? "bg-primary/10" : "",
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.fileName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatted} • {item.rowCount} records
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedId === item.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectRecord(item.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {selectedId === item.id ? "Viewing" : "View"}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeRecord(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPanel;

