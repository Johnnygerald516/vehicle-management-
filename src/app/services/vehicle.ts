import { Injectable } from '@angular/core';
import { Vehicle } from '../models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly storageKey = 'vms.vehicles';

  getVehicles(): Vehicle[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as Vehicle[]) : [];
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.id === id);
  }

  saveVehicle(vehicle: Vehicle): void {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === vehicle.id);
    if (index >= 0) {
      vehicles[index] = vehicle;
    } else {
      vehicles.push(vehicle);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(vehicles));
  }

  deleteVehicle(id: string): void {
    const vehicles = this.getVehicles().filter(v => v.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(vehicles));
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
