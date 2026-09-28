export interface WorkOrder {
  id: string;
  requestId: string;
  vehicleId: string;
  maintenanceType: string;
  tasks: string;
  mechanic: string;
  expectedCompletion: string;
  actualCompletion?: string;
  parts: string;
  cost: number;
  status: 'open' | 'in_progress' | 'completed' | 'approved';
}
