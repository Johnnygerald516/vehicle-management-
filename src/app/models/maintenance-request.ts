export interface MaintenanceRequest {
  id: string;
  vehicleId: string;
  currentMileage: number;
  problem: string;
  requestedBy: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'closed';
  requestDate: string;
}
