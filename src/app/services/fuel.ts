import { Injectable } from '@angular/core';
import { FuelEntry } from '../models/fuel-entry';

@Injectable({
  providedIn: 'root',
})
export class FuelService {
  private readonly key = 'car-service.fuel';

  getEntries(): FuelEntry[] {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as FuelEntry[]) : [];
  }

  saveEntry(entry: FuelEntry): void {
    const entries = this.getEntries();
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(this.key, JSON.stringify(entries));
  }

  deleteEntry(id: string): void {
    const entries = this.getEntries().filter(e => e.id !== id);
    localStorage.setItem(this.key, JSON.stringify(entries));
  }

  getTotalLitres(vehicleId: string): number {
    return this.getEntries()
      .filter(e => e.vehicleId === vehicleId)
      .reduce((sum, e) => sum + (e.litres || 0), 0);
  }

  getTotalCost(vehicleId: string): number {
    return this.getEntries()
      .filter(e => e.vehicleId === vehicleId)
      .reduce((sum, e) => sum + (e.cost || 0), 0);
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
