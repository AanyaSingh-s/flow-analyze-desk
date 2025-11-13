import { useState, useMemo, useEffect } from "react";
import { FlaskConical } from "lucide-react";
import { CSVUploader } from "@/components/CSVUploader";
import { EquipmentTable } from "@/components/EquipmentTable";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { EquipmentData } from "@/types/equipment";
import { calculateStats } from "@/utils/statsCalculator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [equipmentData, setEquipmentData] = useState<EquipmentData[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const stats = useMemo(() => calculateStats(equipmentData), [equipmentData]);

  const handleDataLoaded = async (data: EquipmentData[]) => {
    setEquipmentData(data);

    if (!user) return;

    // Check if history is paused
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_history_paused")
      .eq("user_id", user.id)
      .single();

    if (profile?.is_history_paused) {
      toast({
        title: "History paused",
        description: "This upload was not saved to history",
      });
      return;
    }

    // Save to database
    const { error } = await supabase.from("csv_uploads").insert({
      user_id: user.id,
      filename: "equipment_data.csv",
      equipment_data: data as any,
      stats: stats as any,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save upload history",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background/60 backdrop-blur-lg border-b border-border/50 text-foreground shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-primary-foreground/90 mt-1">
                Upload and analyze your equipment data
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
            <CSVUploader onDataLoaded={handleDataLoaded} />
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
    </div>
  );
};

export default Dashboard;
