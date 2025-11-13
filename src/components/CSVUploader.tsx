import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Download } from "lucide-react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EquipmentData } from "@/types/equipment";
import { useUploadHistory } from "@/contexts/UploadHistoryContext";
import { useToast } from "@/components/ui/use-toast";

type RawRow = {
  "Equipment Name"?: string | number | null;
  Type?: string | number | null;
  Flowrate?: string | number | null;
  Pressure?: string | number | null;
  Temperature?: string | number | null;
  [key: string]: string | number | null | undefined;
};

interface CSVUploaderProps {
  onDataLoaded: (payload: { data: EquipmentData[]; fileName: string }) => void;
}

const REQUIRED_COLUMNS: Array<keyof EquipmentData> = [
  "Equipment Name",
  "Type",
  "Flowrate",
  "Pressure",
  "Temperature",
];

const toNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

export const CSVUploader = ({ onDataLoaded }: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { recordUpload, paused } = useUploadHistory();
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setFileName(file.name);

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      Papa.parse<RawRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rawRows = results.data;

          if (!rawRows || rawRows.length === 0) {
            setError("CSV file is empty");
            return;
          }

          const missingColumns = REQUIRED_COLUMNS.filter((column) => !(column in rawRows[0]));
          if (missingColumns.length > 0) {
            setError(`Missing required columns: ${missingColumns.join(", ")}`);
            return;
          }

          const normalized: EquipmentData[] = rawRows.map((row) => ({
            "Equipment Name": String(row["Equipment Name"] ?? "").trim(),
            Type: String(row.Type ?? "").trim(),
            Flowrate: toNumber(row.Flowrate),
            Pressure: toNumber(row.Pressure),
            Temperature: toNumber(row.Temperature),
          }));

          const hasInvalidNumeric = normalized.some(
            (row) => Number.isNaN(row.Flowrate) || Number.isNaN(row.Pressure) || Number.isNaN(row.Temperature),
          );

          if (hasInvalidNumeric) {
            setError("Some rows contain invalid numeric values for Flowrate, Pressure, or Temperature");
            return;
          }

          onDataLoaded({ data: normalized, fileName: file.name });
          recordUpload(file.name, normalized);

          if (paused) {
            toast({
              title: "History paused",
              description: "Resume history to capture new uploads automatically.",
            });
          } else {
            toast({
              title: "Upload recorded",
              description: `${file.name} added to your dashboard.`,
            });
          }
        },
        error: (parseError) => {
          setError(`Error parsing CSV: ${parseError.message}`);
        },
      });
    },
    [onDataLoaded, paused, recordUpload, toast],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  return (
    <div className="w-full space-y-4 rounded-lg bg-black/10 p-4 opacity-65">
      <Card
        className={`border-2 transition-all duration-300 ${
          isDragging ? "border-primary bg-primary/5 shadow-medium" : "border-border hover:border-primary/10 hover:shadow-soft"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-gradient-primary p-4">
              {fileName ? (
                <FileSpreadsheet className="h-12 w-12 text-primary-foreground" />
              ) : (
                <Upload className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
          </div>

          <h3 className="mb-2 text-xl font-semibold text-foreground">{fileName ? fileName : "Upload CSV File"}</h3>

          <p className="mb-6 text-muted-foreground">
            {fileName ? "File loaded successfully. Upload another to replace." : "Drag and drop your equipment data CSV or click to browse"}
          </p>

          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              className="bg-primary transition-opacity hover:opacity-90"
              onClick={() => document.getElementById("csv-input")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/50" asChild>
              <a href="/sample_equipment_data.csv" download>
                <Download className="mr-2 h-4 w-4" />
                Sample CSV
              </a>
            </Button>
            <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Required columns: Equipment Name, Type, Flowrate, Pressure, Temperature
          </p>
        </div>
      </Card>

      {error ? (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
