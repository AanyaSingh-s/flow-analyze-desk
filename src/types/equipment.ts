export interface EquipmentData {
  "Equipment Name": string;
  Type: string;
  Flowrate: number;
  Pressure: number;
  Temperature: number;
}

export interface EquipmentStats {
  count: number;
  avgFlowrate: number;
  avgPressure: number;
  avgTemperature: number;
  minFlowrate: number;
  maxFlowrate: number;
  minPressure: number;
  maxPressure: number;
  minTemperature: number;
  maxTemperature: number;
  typeDistribution: Record<string, number>;
}
