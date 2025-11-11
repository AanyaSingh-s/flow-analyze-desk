import { TrendingUp, Activity, Gauge, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EquipmentStats } from "@/types/equipment";

interface StatsCardsProps {
  stats: EquipmentStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: "Total Equipment",
      value: stats.count,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Avg Flowrate",
      value: stats.avgFlowrate.toFixed(2),
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Avg Pressure",
      value: stats.avgPressure.toFixed(2),
      icon: Gauge,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Avg Temperature",
      value: stats.avgTemperature.toFixed(2),
      icon: Thermometer,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
