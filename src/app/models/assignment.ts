export interface Assignment {
  id: string;
  vehicleId: string;
  driverId: string;
  department: string;
  purpose: string;
  route: string;
  startDate: string;
  endDate: string;
  departureTime?: string;
  returnTime?: string;
  startOdometer?: number;
  endOdometer?: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
}

export interface AssignmentView extends Assignment {
  vehicleName: string;
  driverName: string;
}
