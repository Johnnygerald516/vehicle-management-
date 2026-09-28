import { Injectable } from '@angular/core';
import { ServiceRecord } from '../models/service-record';
import { VehicleService } from './vehicle';

@Injectable({
  providedIn: 'root',
})
export class ServiceRecordService {
  private readonly storageKey = 'car-service.records';

  constructor(private vehicleService: VehicleService) {}

  getRecords(vehicleId?: string): ServiceRecord[] {
    const raw = localStorage.getItem(this.storageKey);
    const records: ServiceRecord[] = raw ? (JSON.parse(raw) as ServiceRecord[]) : [];
    return vehicleId ? records.filter(r => r.vehicleId === vehicleId) : records;
  }

  addRecord(record: ServiceRecord): void {
    const records = this.getRecords();
    records.unshift(record);
    localStorage.setItem(this.storageKey, JSON.stringify(records));

    const vehicle = this.vehicleService.getVehicleById(record.vehicleId);
    if (vehicle) {
      vehicle.mileage = Math.max(vehicle.mileage, record.mileage);
      if (!vehicle.lastServiceDate || record.serviceDate > vehicle.lastServiceDate) {
        vehicle.lastServiceDate = record.serviceDate;
      }
      if (record.nextServiceDate) {
        vehicle.nextServiceDue = record.nextServiceDate;
      } else {
        const next = new Date(record.serviceDate);
        next.setMonth(next.getMonth() + 6);
        vehicle.nextServiceDue = next.toISOString().slice(0, 10);
      }
      if (record.nextServiceMileage) {
        vehicle.nextServiceMileage = record.nextServiceMileage;
      }
      this.vehicleService.saveVehicle(vehicle);
    }
  }

  deleteRecord(id: string): void {
    const records = this.getRecords().filter(r => r.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
