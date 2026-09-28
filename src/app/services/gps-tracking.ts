import { Injectable } from '@angular/core';
import { GpsPosition, GpsStatus, VehicleTrackingView } from '../models/gps-position';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from './vehicle';
import { AssignmentService } from './assignment';

const ACTIVE_TIMEOUT_MS = 2 * 60 * 1000;
const DELAYED_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 3000;

const DAR_ES_SALAAM = { lat: -6.1639, lng: 39.1979 };

@Injectable({
  providedIn: 'root',
})
export class GpsTrackingService {
  private readonly storageKey = 'car-service.gps-positions';
  private positions = new Map<string, GpsPosition>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private listeners: Array<() => void> = [];

  constructor(
    private vehicleService: VehicleService,
    private assignmentService: AssignmentService
  ) {
    this.loadPersisted();
  }

  startTracking(vehicleId: string): void {
    if (this.timers.has(vehicleId)) return;

    const initial: GpsPosition = {
      vehicleId,
      latitude: DAR_ES_SALAAM.lat + (Math.random() - 0.5) * 0.05,
      longitude: DAR_ES_SALAAM.lng + (Math.random() - 0.5) * 0.05,
      speed: Math.round(Math.random() * 60),
      timestamp: new Date().toISOString(),
    };
    this.positions.set(vehicleId, initial);
    this.persist();
    this.notify();

    const timer = setInterval(() => {
      this.updatePosition(vehicleId);
    }, POLL_INTERVAL_MS);
    this.timers.set(vehicleId, timer);
  }

  stopTracking(vehicleId: string): void {
    const timer = this.timers.get(vehicleId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(vehicleId);
    }
  }

  stopAll(): void {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
  }

  isTracking(vehicleId: string): boolean {
    return this.timers.has(vehicleId);
  }

  getPosition(vehicleId: string): GpsPosition | undefined {
    return this.positions.get(vehicleId);
  }

  getTrackingViews(): VehicleTrackingView[] {
    const vehicles = this.vehicleService.getVehicles();
    const assignments = this.assignmentService.getAssignmentView();
    const activeAssignments = assignments.filter(a => a.status === 'active');

    return vehicles.map(v => {
      const pos = this.positions.get(v.id);
      const assignment = activeAssignments.find(a => a.vehicleId === v.id);
      return {
        vehicleId: v.id,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        licensePlate: v.licensePlate,
        driverName: assignment ? assignment.driverName : 'Unassigned',
        latitude: pos ? pos.latitude : null,
        longitude: pos ? pos.longitude : null,
        speed: pos ? pos.speed : null,
        lastUpdate: pos ? pos.timestamp : null,
        status: this.deriveStatus(v.id, pos),
      };
    });
  }

  deriveStatus(vehicleId: string, pos: GpsPosition | undefined): GpsStatus {
    if (!pos) return 'offline';
    if (!this.isTracking(vehicleId)) return 'offline';
    const elapsed = Date.now() - new Date(pos.timestamp).getTime();
    if (elapsed > DELAYED_TIMEOUT_MS) return 'offline';
    if (elapsed > ACTIVE_TIMEOUT_MS) return 'delayed';
    return 'active';
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updatePosition(vehicleId: string): void {
    const current = this.positions.get(vehicleId);
    if (!current) return;

    const updated: GpsPosition = {
      vehicleId,
      latitude: current.latitude + (Math.random() - 0.5) * 0.002,
      longitude: current.longitude + (Math.random() - 0.5) * 0.002,
      speed: Math.max(0, Math.round(current.speed + (Math.random() - 0.5) * 20)),
      timestamp: new Date().toISOString(),
    };
    this.positions.set(vehicleId, updated);
    this.persist();
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  private persist(): void {
    const data: GpsPosition[] = Array.from(this.positions.values());
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private loadPersisted(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;
    const data = JSON.parse(raw) as GpsPosition[];
    data.forEach(p => this.positions.set(p.vehicleId, p));
  }
}
