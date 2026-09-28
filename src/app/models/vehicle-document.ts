export type DocumentType =
  | 'insurance'
  | 'road_license'
  | 'driver_license'
  | 'inspection'
  | 'scheduled_service'
  | 'other';

export interface VehicleDocument {
  id: string;
  vehicleId?: string;
  driverId?: string;
  type: DocumentType;
  referenceNumber: string;
  issueDate: string;
  expiryDate: string;
  notes?: string;
}

export interface DocumentView extends VehicleDocument {
  subjectName: string;
}

export type AlertStatus = 'expired' | 'due_soon' | 'valid';
