import { useState, useMemo } from "react";
import { FlaskConical } from "lucide-react";
import { CSVUploader } from "@/components/CSVUploader";
import { EquipmentTable } from "@/components/EquipmentTable";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { EquipmentData } from "@/types/equipment";
import { calculateStats } from "@/utils/statsCalculator";

const Index = () => {
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);

  const stats = useMemo(() => calculateStats(equipmentData), [equipmentData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground shadow-large">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Chemical Equipment Analyzer</h1>
              <p className="text-primary-foreground/90 mt-1">
                Upload, analyze, and visualize your equipment data
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <CSVUploader onDataLoaded={setEquipmentData} />
          </section>

          {/* Dashboard */}
          {equipmentData.length > 0 && (
            <>
              {/* Stats Cards */}
              <section>
                <StatsCards stats={stats} />
              </section>

              {/* Charts */}
              <section>
                <Charts data={equipmentData} stats={stats} />
              </section>

              {/* Data Table */}
              <section>
                <EquipmentTable data={equipmentData} />
              </section>
            </>
          )}

          {/* Empty State */}
          {equipmentData.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-block p-6 bg-muted/30 rounded-full mb-4">
                <FlaskConical className="w-16 h-16 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No Data Loaded
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload a CSV file to start analyzing your chemical equipment data.
                Your dashboard will appear here with interactive charts and tables.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Chemical Equipment Analyzer • Built with React & Chart.js</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
