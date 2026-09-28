import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Trip } from '../models/trip';
import { VehicleTrackingView } from '../models/gps-position';
import { TripService } from '../services/trip';
import { GpsTrackingService } from '../services/gps-tracking';

@Component({
  selector: 'app-tracking',
  imports: [FormsModule, RouterLink],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css',
})
export class Tracking implements OnInit, OnDestroy {
  private tripService = inject(TripService);
  private gpsService = inject(GpsTrackingService);

  vehicles = signal<VehicleTrackingView[]>([]);
  selectedVehicleId = signal<string | null>(null);
  trips = signal<Trip[]>([]);
  now = new Date().toISOString().slice(0, 16);
  newTrip = this.emptyTrip();

  private unsubscribe?: () => void;
  private refreshTimer?: ReturnType<typeof setInterval>;

  selectedVehicle = computed(() =>
    this.vehicles().find(v => v.vehicleId === this.selectedVehicleId()) ?? null
  );

  activeTrip = computed(() => this.trips().find(t => t.status === 'in_progress'));

  ngOnInit(): void {
    this.refresh();
    this.loadTrips();

    this.unsubscribe = this.gpsService.subscribe(() => this.refresh());

    this.refreshTimer = setInterval(() => this.refresh(), 1000);
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  refresh(): void {
    this.vehicles.set(this.gpsService.getTrackingViews());
  }

  loadTrips(): void {
    this.trips.set(this.tripService.getTrips());
  }

  selectVehicle(vehicleId: string): void {
    this.selectedVehicleId.set(vehicleId);
  }

  isTracking(vehicleId: string): boolean {
    return this.gpsService.isTracking(vehicleId);
  }

  toggleTracking(vehicleId: string): void {
    if (this.gpsService.isTracking(vehicleId)) {
      this.gpsService.stopTracking(vehicleId);
    } else {
      this.gpsService.startTracking(vehicleId);
    }
    this.refresh();
  }

  emptyTrip(): Trip {
    return {
      id: '',
      vehicleId: '',
      driverName: '',
      startTime: this.now,
      startLocation: '',
      endLocation: '',
      distance: 0,
      status: 'in_progress',
    };
  }

  startTrip(): void {
    if (!this.newTrip.vehicleId || !this.newTrip.startLocation) return;
    this.newTrip.id = this.tripService.generateId();
    this.tripService.saveTrip(this.newTrip);
    this.gpsService.startTracking(this.newTrip.vehicleId);
    this.newTrip = this.emptyTrip();
    this.loadTrips();
    this.refresh();
  }

  endTrip(trip: Trip): void {
    const updated: Trip = { ...trip, endTime: this.now, status: 'completed' };
    this.tripService.saveTrip(updated);
    this.gpsService.stopTracking(trip.vehicleId);
    this.loadTrips();
    this.refresh();
  }

  cancelTrip(trip: Trip): void {
    const updated: Trip = { ...trip, status: 'cancelled' };
    this.tripService.saveTrip(updated);
    this.gpsService.stopTracking(trip.vehicleId);
    this.loadTrips();
    this.refresh();
  }

  deleteTrip(id: string): void {
    if (confirm('Delete this trip record?')) {
      this.tripService.deleteTrip(id);
      this.loadTrips();
    }
  }

  vehicleName(id: string): string {
    const v = this.vehicles().find(x => x.vehicleId === id);
    return v ? v.vehicleName : 'Unknown Vehicle';
  }

  formatTime(timestamp: string | null): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
