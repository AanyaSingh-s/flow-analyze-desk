// src/pages/Dashboard.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EquipmentData } from "@/types/equipment";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import HistoryPanel from "@/components/dashboard/HistoryPanel";
import { CSVUploader } from "@/components/CSVUploader";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { EquipmentTable } from "@/components/EquipmentTable";
import { calculateStats } from "@/utils/statsCalculator";
import { useUploadHistory } from "@/contexts/UploadHistoryContext";
import Iridescence from "@/components/Iridescence";
import { datasetAPI, authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Dashboard = () => {
  const { selectedRecord, history, addRecord } = useUploadHistory();
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedRecord) {
      setEquipmentData(selectedRecord.data);
      setActiveFileName(selectedRecord.fileName);
    } else if (history.length === 0) {
      setEquipmentData([]);
      setActiveFileName(null);
    }
  }, [selectedRecord, history.length]);

  const stats = useMemo(() => calculateStats(equipmentData), [equipmentData]);

  const handleDataLoaded = useCallback(
    async ({ data, fileName, file }: { data: EquipmentData[]; fileName: string; file?: File }) => {
      setEquipmentData(data);
      setActiveFileName(fileName);

      // Upload to Django backend
      if (file) {
        setIsUploading(true);
        try {
          const result = await datasetAPI.upload(file);
          
          // Add to local history with backend ID
          addRecord({
            data,
            fileName,
            timestamp: new Date(),
            datasetId: result.dataset.id
          });

          toast({
            title: "Success",
            description: `${fileName} uploaded and analyzed successfully!`,
          });
        } catch (error: any) {
          console.error('Upload error:', error);
          toast({
            title: "Upload Warning",
            description: "Data displayed locally, but backend sync failed. Check if backend is running.",
            variant: "destructive",
          });
          
          // Still add to local history even if backend fails
          addRecord({
            data,
            fileName,
            timestamp: new Date(),
          });
        } finally {
          setIsUploading(false);
        }
      }
    },
    [addRecord, toast]
  );

  const handleGenerateReport = async () => {
    if (!selectedRecord?.datasetId) {
      toast({
        title: "Error",
        description: "No dataset selected or dataset not synced with backend.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await datasetAPI.generateReport(selectedRecord.datasetId);
      
      // Open PDF in new tab
      if (result.report.report_url) {
        window.open(result.report.report_url, '_blank');
      }

      toast({
        title: "Success",
        description: "PDF report generated successfully!",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Check if backend is running.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 opacity-90">
        <Iridescence color={[0.4, 0.7, 0.9]} speed={0.4} amplitude={0.18} />
      </div>
      <DashboardLayout
        sidebar={<DashboardSidebar />}
        title="Dashboard"
        description={
          activeFileName
            ? `Viewing ${activeFileName} • ${equipmentData.length} records`
            : "Upload a CSV file to explore your equipment data."
        }
        className="space-y-8"
      >
        <section id="uploads" className="space-y-4">
          <h2 className="text-xl font-semibold">Upload new data</h2>
          <p className="text-sm text-foreground">
            Drop a CSV file to update your dashboard. History keeps the last 50 uploads so you can revisit them later.
          </p>
          <CSVUploader onDataLoaded={handleDataLoaded} disabled={isUploading} />
          {isUploading && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Syncing with backend...
            </div>
          )}
        </section>

        <section id="overview" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            <div className="flex items-center gap-4">
              {activeFileName && (
                <span className="text-sm text-muted-foreground">
                  Current file: {activeFileName}
                </span>
              )}
              {selectedRecord?.datasetId && (
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Generate PDF Report
                </button>
              )}
            </div>
          </div>
          {equipmentData.length > 0 ? (
            <div className="space-y-6">
              <StatsCards stats={stats} />
              <Charts data={equipmentData} stats={stats} />
              <EquipmentTable data={equipmentData} />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-background/50 p-12 text-center text-sm text-muted-foreground">
              Upload a CSV file or choose one from your history to see analytics and charts.
            </div>
          )}
        </section>

        <section id="history" className="opacity-60 space-y-4">
          <h2 className="text-xl font-semibold">History</h2>
          <HistoryPanel />
        </section>
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;
