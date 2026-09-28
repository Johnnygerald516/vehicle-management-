export interface Incident {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  location: string;
  description: string;
  damage: string;
  policeReportNumber: string;
  insuranceClaimNumber: string;
  repairCost: number;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  images: string[];
}

export interface IncidentView extends Incident {
  vehicleName: string;
  driverName: string;
}
