import { Injectable } from '@angular/core';
import { Incident, IncidentView } from '../models/incident';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { VehicleService } from './vehicle';
import { DriverService } from './driver';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private readonly storageKey = 'car-service.incidents';

  constructor(
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  getIncidents(): Incident[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as Incident[]) : [];
  }

  getIncidentView(): IncidentView[] {
    const incidents = this.getIncidents();
    const vehicles = this.vehicleService.getVehicles();
    const drivers = this.driverService.getDrivers();

    const vMap = new Map<string, Vehicle>();
    vehicles.forEach(v => vMap.set(v.id, v));
    const dMap = new Map<string, Driver>();
    drivers.forEach(d => dMap.set(d.id, d));

    return incidents.map(i => ({
      ...i,
      vehicleName: vMap.get(i.vehicleId)
        ? `${vMap.get(i.vehicleId)!.year} ${vMap.get(i.vehicleId)!.make} ${vMap.get(i.vehicleId)!.model}`
        : 'Unknown Vehicle',
      driverName: dMap.get(i.driverId)?.name ?? 'Unknown Driver',
    }));
  }

  saveIncident(incident: Incident): void {
    const incidents = this.getIncidents();
    const index = incidents.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      incidents[index] = incident;
    } else {
      incidents.push(incident);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(incidents));
  }

  deleteIncident(id: string): void {
    const incidents = this.getIncidents().filter(i => i.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(incidents));
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
