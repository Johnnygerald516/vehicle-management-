import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Driver } from '../models/driver';
import { Assignment } from '../models/assignment';
import { Trip } from '../models/trip';
import { Incident } from '../models/incident';
import { DriverService } from '../services/driver';
import { AssignmentService } from '../services/assignment';
import { TripService } from '../services/trip';
import { IncidentService } from '../services/incident';

interface DriverProfile {
  driver: Driver;
  assignment?: Assignment;
  vehicleName: string;
  trips: Trip[];
  incidents: Incident[];
}

@Component({
  selector: 'app-drivers',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
})
export class Drivers implements OnInit {
  drivers: Driver[] = [];
  editing: Driver = this.empty();
  showForm = false;
  profile: DriverProfile | null = null;

  constructor(
    private driverService: DriverService,
    private assignmentService: AssignmentService,
    private tripService: TripService,
    private incidentService: IncidentService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.drivers = this.driverService.getDrivers();
  }

  empty(): Driver {
    return {
      id: '',
      name: '',
      licenseNumber: '',
      phone: '',
      email: '',
      licenseCategory: '',
      licenseIssueDate: '',
      licenseExpiryDate: '',
      employeeId: '',
      address: '',
      emergencyContact: '',
      status: 'active',
    };
  }

  addNew(): void {
    this.editing = this.empty();
    this.showForm = true;
  }

  edit(d: Driver): void {
    this.editing = { ...d };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = this.empty();
  }

  save(): void {
    if (!this.editing.id) {
      this.editing.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    this.driverService.saveDriver(this.editing);
    this.showForm = false;
    this.editing = this.empty();
    this.load();
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driverService.deleteDriver(id);
      this.load();
    }
  }

  view(d: Driver): void {
    const assignments = this.assignmentService.getAssignmentView();
    const active = assignments.find(a => a.driverId === d.id && (a.status === 'active' || a.status === 'approved'));
    this.profile = {
      driver: d,
      assignment: active,
      vehicleName: active ? active.vehicleName : 'Unassigned',
      trips: this.tripService.getTrips().filter(t => t.driverName === d.name),
      incidents: this.incidentService.getIncidents().filter(i => i.driverId === d.id),
    };
  }

  closeProfile(): void {
    this.profile = null;
  }

  completedTrips(): number {
    return this.profile?.trips.filter(t => t.status === 'completed').length ?? 0;
  }

  licenceStatus(d: Driver): string {
    if (!d.licenseExpiryDate) return 'valid';
    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    if (d.licenseExpiryDate < today) return 'expired';
    if (d.licenseExpiryDate <= soon.toISOString().slice(0, 10)) return 'expiring';
    return 'valid';
  }
}
