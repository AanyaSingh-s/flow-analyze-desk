import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EquipmentData } from "@/types/equipment";

interface CSVUploaderProps {
  onDataLoaded: (data: EquipmentData[]) => void;
}

export const CSVUploader = ({ onDataLoaded }: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validateData = (data: any[]): data is EquipmentData[] => {
    if (!data || data.length === 0) {
      setError("CSV file is empty");
      return false;
    }

    const requiredColumns = ["Equipment Name", "Type", "Flowrate", "Pressure", "Temperature"];
    const firstRow = data[0];
    
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    if (missingColumns.length > 0) {
      setError(`Missing required columns: ${missingColumns.join(", ")}`);
      return false;
    }

    // Validate numeric fields
    const hasInvalidData = data.some(row => {
      const flowrate = parseFloat(row.Flowrate);
      const pressure = parseFloat(row.Pressure);
      const temperature = parseFloat(row.Temperature);
      return isNaN(flowrate) || isNaN(pressure) || isNaN(temperature);
    });

    if (hasInvalidData) {
      setError("Some rows contain invalid numeric values for Flowrate, Pressure, or Temperature");
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => ({
          "Equipment Name": row["Equipment Name"]?.trim() || "",
          Type: row["Type"]?.trim() || "",
          Flowrate: parseFloat(row.Flowrate) || 0,
          Pressure: parseFloat(row.Pressure) || 0,
          Temperature: parseFloat(row.Temperature) || 0,
        }));

        if (validateData(data)) {
          onDataLoaded(data);
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      },
    });
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="w-full space-y-4">
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? "border-primary bg-primary/5 shadow-medium"
            : "border-border hover:border-primary/50 hover:shadow-soft"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-primary rounded-full">
              {fileName ? (
                <FileSpreadsheet className="w-12 h-12 text-primary-foreground" />
              ) : (
                <Upload className="w-12 h-12 text-primary-foreground" />
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2 text-foreground">
            {fileName ? fileName : "Upload CSV File"}
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {fileName 
              ? "File loaded successfully. Upload another to replace."
              : "Drag and drop your equipment data CSV or click to browse"
            }
          </p>

          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
              onClick={() => document.getElementById("csv-input")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              asChild
            >
              <a href="/sample_equipment_data.csv" download>
                <Download className="w-4 h-4 mr-2" />
                Sample CSV
              </a>
            </Button>
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Required columns: Equipment Name, Type, Flowrate, Pressure, Temperature
          </p>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
