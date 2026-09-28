import { Injectable } from '@angular/core';
import { VehicleDocument, DocumentView } from '../models/vehicle-document';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { VehicleService } from './vehicle';
import { DriverService } from './driver';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly storageKey = 'car-service.documents';

  constructor(
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  getDocuments(): VehicleDocument[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as VehicleDocument[]) : [];
  }

  getDocumentView(): DocumentView[] {
    const vehicles = this.vehicleService.getVehicles();
    const drivers = this.driverService.getDrivers();
    const vMap = new Map<string, Vehicle>();
    vehicles.forEach(v => vMap.set(v.id, v));
    const dMap = new Map<string, Driver>();
    drivers.forEach(d => dMap.set(d.id, d));

    return this.getDocuments().map(doc => {
      let subjectName = '-';
      if (doc.vehicleId && vMap.get(doc.vehicleId)) {
        const v = vMap.get(doc.vehicleId)!;
        subjectName = `${v.year} ${v.make} ${v.model} (${v.licensePlate})`;
      } else if (doc.driverId && dMap.get(doc.driverId)) {
        subjectName = dMap.get(doc.driverId)!.name;
      }
      return { ...doc, subjectName };
    });
  }

  saveDocument(doc: VehicleDocument): void {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      documents[index] = doc;
    } else {
      documents.push(doc);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(documents));
  }

  deleteDocument(id: string): void {
    const documents = this.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(documents));
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
