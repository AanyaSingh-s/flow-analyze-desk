import { EquipmentData, EquipmentStats } from "@/types/equipment";

export const calculateStats = (data: EquipmentData[]): EquipmentStats => {
  if (data.length === 0) {
    return {
      count: 0,
      avgFlowrate: 0,
      avgPressure: 0,
      avgTemperature: 0,
      minFlowrate: 0,
      maxFlowrate: 0,
      minPressure: 0,
      maxPressure: 0,
      minTemperature: 0,
      maxTemperature: 0,
      typeDistribution: {},
    };
  }

  const flowrates = data.map((d) => d.Flowrate);
  const pressures = data.map((d) => d.Pressure);
  const temperatures = data.map((d) => d.Temperature);

  const typeDistribution: Record<string, number> = {};
  data.forEach((item) => {
    typeDistribution[item.Type] = (typeDistribution[item.Type] || 0) + 1;
  });

  return {
    count: data.length,
    avgFlowrate: flowrates.reduce((a, b) => a + b, 0) / data.length,
    avgPressure: pressures.reduce((a, b) => a + b, 0) / data.length,
    avgTemperature: temperatures.reduce((a, b) => a + b, 0) / data.length,
    minFlowrate: Math.min(...flowrates),
    maxFlowrate: Math.max(...flowrates),
    minPressure: Math.min(...pressures),
    maxPressure: Math.max(...pressures),
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
    typeDistribution,
  };
};
