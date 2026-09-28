export interface Trip {
  id: string;
  vehicleId: string;
  driverName?: string;
  startTime: string;
  endTime?: string;
  startLocation: string;
  endLocation?: string;
  distance?: number;
  status: 'in_progress' | 'completed' | 'cancelled';
}
