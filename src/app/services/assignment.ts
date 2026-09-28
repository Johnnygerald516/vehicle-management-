import { Injectable } from '@angular/core';
import { Assignment, AssignmentView } from '../models/assignment';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { VehicleService } from './vehicle';
import { DriverService } from './driver';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private readonly storageKey = 'car-service.assignments';

  constructor(
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  getAssignments(): Assignment[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as Assignment[]) : [];
  }

  getAssignmentView(): AssignmentView[] {
    const assignments = this.getAssignments();
    const vehicles = this.vehicleService.getVehicles();
    const drivers = this.driverService.getDrivers();

    const vMap = new Map<string, Vehicle>();
    vehicles.forEach(v => vMap.set(v.id, v));
    const dMap = new Map<string, Driver>();
    drivers.forEach(d => dMap.set(d.id, d));

    return assignments.map(a => ({
      ...a,
      vehicleName: this.vehicleName(vMap.get(a.vehicleId)),
      driverName: this.driverName(dMap.get(a.driverId)),
    }));
  }

  private vehicleName(v: Vehicle | undefined): string {
    return v ? `${v.year} ${v.make} ${v.model}` : 'Unknown Vehicle';
  }

  private driverName(d: Driver | undefined): string {
    return d ? d.name : 'Unknown Driver';
  }

  saveAssignment(assignment: Assignment): void {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignment.id);
    if (index >= 0) {
      assignments[index] = assignment;
    } else {
      assignments.push(assignment);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(assignments));
  }

  deleteAssignment(id: string): void {
    const assignments = this.getAssignments().filter(a => a.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(assignments));
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
