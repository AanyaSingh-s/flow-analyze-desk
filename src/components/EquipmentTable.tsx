import { useState, useMemo } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EquipmentData } from "@/types/equipment";

interface EquipmentTableProps {
  data: EquipmentData[];
}

type SortKey = keyof EquipmentData;
type SortOrder = "asc" | "desc";

export const EquipmentTable = ({ data }: EquipmentTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("Equipment Name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortOrder === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });

    return filtered;
  }, [data, sortKey, sortOrder, searchQuery]);

  return (
    <Card className="shadow-medium animate-fade-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Equipment Data</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("Equipment Name")}
                    className="font-semibold hover:bg-transparent"
                  >
                    Equipment Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("Type")}
                    className="font-semibold hover:bg-transparent"
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("Flowrate")}
                    className="font-semibold hover:bg-transparent"
                  >
                    Flowrate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("Pressure")}
                    className="font-semibold hover:bg-transparent"
                  >
                    Pressure
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("Temperature")}
                    className="font-semibold hover:bg-transparent"
                  >
                    Temperature
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((item, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">{item["Equipment Name"]}</TableCell>
                  <TableCell>{item.Type}</TableCell>
                  <TableCell>{item.Flowrate.toFixed(2)}</TableCell>
                  <TableCell>{item.Pressure.toFixed(2)}</TableCell>
                  <TableCell>{item.Temperature.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedData.length} of {data.length} entries
        </div>
      </div>
    </Card>
  );
};
