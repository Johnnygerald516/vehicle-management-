import { Injectable } from '@angular/core';
import { Driver } from '../models/driver';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private readonly storageKey = 'vms.drivers';

  getDrivers(): Driver[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as Driver[]) : [];
  }

  getDriverById(id: string): Driver | undefined {
    return this.getDrivers().find(d => d.id === id);
  }

  saveDriver(driver: Driver): void {
    const drivers = this.getDrivers();
    const index = drivers.findIndex(d => d.id === driver.id);
    if (index >= 0) {
      drivers[index] = driver;
    } else {
      drivers.push(driver);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(drivers));
  }

  deleteDriver(id: string): void {
    const drivers = this.getDrivers().filter(d => d.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(drivers));
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
