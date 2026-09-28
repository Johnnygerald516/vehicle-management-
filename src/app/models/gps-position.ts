export interface GpsPosition {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export type GpsStatus = 'active' | 'delayed' | 'offline';

export interface VehicleTrackingView {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  driverName: string;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  lastUpdate: string | null;
  status: GpsStatus;
}
