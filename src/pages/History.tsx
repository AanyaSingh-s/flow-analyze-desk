import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EquipmentTable } from "@/components/EquipmentTable";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { EquipmentData, EquipmentStats } from "@/types/equipment";

interface Upload {
  id: string;
  filename: string;
  uploaded_at: string;
  equipment_data: any;
  stats: any;
}

const History = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUploads();
  }, [user]);

  const fetchUploads = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("csv_uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch upload history",
      });
    } else {
      setUploads(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("csv_uploads").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete upload",
      });
    } else {
      toast({
        title: "Success",
        description: "Upload deleted successfully",
      });
      fetchUploads();
      if (selectedUpload?.id === id) {
        setSelectedUpload(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-background/60 backdrop-blur-lg border-b border-border/50 text-foreground shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Upload History</h1>
              <p className="text-primary-foreground/90 mt-1">
                View and manage your previously uploaded datasets
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
            {uploads.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No uploads yet</p>
                </CardContent>
              </Card>
            ) : (
              uploads.map((upload) => (
                <Card
                  key={upload.id}
                  className={`cursor-pointer transition-colors ${
                    selectedUpload?.id === upload.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedUpload(upload)}
                >
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {upload.filename}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(upload.uploaded_at), "PPp")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpload(upload);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(upload.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Selected Upload Details */}
          <div className="lg:col-span-2">
            {selectedUpload ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedUpload.filename}</h2>
                  <p className="text-muted-foreground">
                    Uploaded on {format(new Date(selectedUpload.uploaded_at), "PPp")}
                  </p>
                </div>

                <StatsCards stats={selectedUpload.stats} />
                <Charts data={selectedUpload.equipment_data} stats={selectedUpload.stats} />
                <EquipmentTable data={selectedUpload.equipment_data} />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    Select an upload to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
