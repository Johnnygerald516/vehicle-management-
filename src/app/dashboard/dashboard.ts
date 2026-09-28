import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { Trip } from '../models/trip';
import { VehicleService } from '../services/vehicle';
import { DriverService } from '../services/driver';
import { TripService } from '../services/trip';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  trips: Trip[] = [];

  constructor(
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private tripService: TripService
  ) {}

  ngOnInit(): void {
    this.vehicles = this.vehicleService.getVehicles();
    this.drivers = this.driverService.getDrivers();
    this.trips = this.tripService.getTrips();
  }

  totalVehicles(): number {
    return this.vehicles.length;
  }

  onTripVehicles(): number {
    return this.trips.filter(t => t.status === 'in_progress').length;
  }

  maintenanceVehicles(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.vehicles.filter(v => v.status === 'active' && v.nextServiceDue < today).length;
  }

  totalDrivers(): number {
    return this.drivers.length;
  }
}
