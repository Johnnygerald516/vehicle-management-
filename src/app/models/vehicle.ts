export interface Vehicle {
  id: string;
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  engineNumber?: string;
  ownership?: string;
  department?: string;
  insuranceExpiry?: string;
  roadLicenseExpiry?: string;
  inspectionExpiry?: string;
  documents?: string[];
  fuelType: string;
  fuelTankCapacity: number;
  mileage: number;
  nextServiceMileage: number;
  lastServiceDate: string;
  nextServiceDue: string;
  status: 'active' | 'inactive';
}
