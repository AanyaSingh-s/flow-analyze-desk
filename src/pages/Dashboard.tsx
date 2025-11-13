import { useCallback, useEffect, useMemo, useState } from "react";
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

const Dashboard = () => {
  const { selectedRecord, history } = useUploadHistory();
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

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

  const handleDataLoaded = useCallback(({ data, fileName }: { data: EquipmentData[]; fileName: string }) => {
    setEquipmentData(data);
    setActiveFileName(fileName);
  }, []);

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
          <CSVUploader onDataLoaded={handleDataLoaded} />
        </section>

        <section id="overview" className="space-y-4">
          <div className=" flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            {activeFileName ? <span className="text-sm text-muted-foreground">Current file: {activeFileName}</span> : null}
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
