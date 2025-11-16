import { useMemo } from "react";
import { FileText, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EquipmentTable } from "@/components/EquipmentTable";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import Iridescence from "@/components/Iridescence";
import { useUploadHistory } from "@/contexts/UploadHistoryContext";
import { useToast } from "@/components/ui/use-toast";
import { calculateStats } from "@/utils/statsCalculator";

const History = () => {
  const { history, selectedRecord, selectRecord, removeRecord, paused, togglePause, clearHistory } = useUploadHistory();
  const { toast } = useToast();
  const stats = useMemo(() => (selectedRecord ? calculateStats(selectedRecord.data) : null), [selectedRecord]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 opacity-60">
        <Iridescence color={[0.35, 0.65, 0.95]} speed={0.45} amplitude={0.2} />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70">
            <FileText className="h-4 w-4 text-primary" />
            Upload history & recovery
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold">Track every CSV upload</h1>
              <p className="text-white/70">
                Browse previous datasets, restore them to the dashboard, or remove older entries.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => {
                  const nextPaused = !paused;
                  togglePause();
                  toast({
                    title: nextPaused ? "History paused" : "History resumed",
                    description: nextPaused
                      ? "Uploads will not be saved until you resume history."
                      : "New uploads will be captured again.",
                  });
                }}
              >
                {paused ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
                {paused ? "Resume history" : "Pause history"}
              </Button>
              <Button
                variant="destructive"
                className="bg-red-500/80 hover:bg-red-500"
                onClick={() => {
                  clearHistory();
                  toast({
                    title: "History cleared",
                    description: "All cached uploads have been removed.",
                  });
                }}
                disabled={history.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear history
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Recent uploads</CardTitle>
              <CardDescription className="text-white/60">
                {history.length > 0 ? "Select a dataset to inspect" : "Uploads you add will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {history.length === 0 ? (
                <p className="text-sm text-white/60">No uploads yet.</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectRecord(item.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedRecord?.id === item.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>{format(new Date(item.uploadedAt), "PPp")}</span>
                      <span>{item.rowCount} rows</span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-white">{item.fileName}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-white/80 hover:bg-white/10"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectRecord(item.id);
                        }}
                      >
                        View details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-red-300 hover:bg-red-500/20"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeRecord(item.id);
                          toast({
                            title: "Upload removed",
                            description: `${item.fileName} deleted from history.`,
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 p-6 backdrop-blur">
            {selectedRecord ? (
              <div className="space-y-8">
                <div>
                  <p className="text-sm uppercase tracking-wide text-white/60">Currently viewing</p>
                  <h2 className="text-2xl font-semibold text-white">{selectedRecord.fileName}</h2>
                  <p className="text-sm text-white/60">
                    Added on {format(new Date(selectedRecord.uploadedAt), "PPpp")}
                  </p>
                </div>
                {stats ? (
                  <>
                    <StatsCards stats={stats} />
                    <Charts data={selectedRecord.data} stats={stats} />
                  </>
                ) : null}
                <EquipmentTable data={selectedRecord.data} />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-white/60">
                <p>Select an upload from the left to see charts and tables.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default History;
