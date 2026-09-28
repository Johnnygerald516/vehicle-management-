export interface ServiceRecord {
  id: string;
  vehicleId: string;
  workOrderId?: string;
  serviceNumber?: string;
  serviceDate: string;
  mileage: number;
  serviceType: string;
  description: string;
  technician: string;
  garage?: string;
  parts: string;
  labourCost: number;
  otherCost: number;
  cost: number;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  status: 'completed' | 'in_progress' | 'cancelled';
}
