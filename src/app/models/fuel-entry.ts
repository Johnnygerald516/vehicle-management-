export interface FuelEntry {
  id: string;
  vehicleId: string;
  date: string;
  fuelType: string;
  litres: number;
  cost: number;
  mileage: number;
  notes?: string;
}
