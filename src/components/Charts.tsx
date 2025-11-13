import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { EquipmentData, EquipmentStats } from "@/types/equipment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsProps {
  data: EquipmentData[];
  stats: EquipmentStats;
}

export const Charts = ({ data, stats }: ChartsProps) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const barChartData = useMemo(() => ({
    labels: data.slice(0, 10).map((item) => item["Equipment Name"]),
    datasets: [
      {
        label: "Flowrate",
        data: data.slice(0, 10).map((item) => item.Flowrate),
        backgroundColor: "rgba(59, 130, 246, 0.9)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Pressure",
        data: data.slice(0, 10).map((item) => item.Pressure),
        backgroundColor: "rgba(20, 184, 166, 0.7)",
        borderColor: "rgba(20, 184, 166, 1)",
        borderWidth: 1,
      },
    ],
  }), [data]);

  const lineChartData = useMemo(() => ({
    labels: data.slice(0, 15).map((item) => item["Equipment Name"]),
    datasets: [
      {
        label: "Temperature",
        data: data.slice(0, 15).map((item) => item.Temperature),
        borderColor: "rgba(249, 115, 22, 1)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }), [data]);

  const doughnutChartData = useMemo(() => {
    const types = Object.keys(stats.typeDistribution);
    const counts = Object.values(stats.typeDistribution);
    
    const colors = [
      "rgba(59, 130, 246, 0.8)",
      "rgba(20, 184, 166, 0.8)",
      "rgba(249, 115, 22, 0.8)",
      "rgba(139, 92, 246, 0.8)",
      "rgba(236, 72, 153, 0.8)",
    ];

    return {
      labels: types,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, types.length),
          borderColor: colors.slice(0, types.length).map(c => c.replace("0.8", "1")),
          borderWidth: 2,
        },
      ],
    };
  }, [stats.typeDistribution]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="p-6 shadow-medium opacity-75">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Flowrate vs Pressure (Top 10)
        </h3>
        <div className="h-80">
          <Bar options={chartOptions} data={barChartData} />
        </div>
      </Card>

      <Card className="p-6 shadow-medium opacity-75">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Temperature Trend
        </h3>
        <div className="h-80">
          <Line options={chartOptions} data={lineChartData} />
        </div>
      </Card>

      <Card className="p-6 shadow-medium lg:col-span-2 opacity-75">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Equipment Type Distribution
        </h3>
        <div className="h-80 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>
      </Card>
    </div>
  );
};
