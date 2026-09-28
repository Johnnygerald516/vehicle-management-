import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Incident, IncidentView } from '../models/incident';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { IncidentService } from '../services/incident';
import { VehicleService } from '../services/vehicle';
import { DriverService } from '../services/driver';

@Component({
  selector: 'app-incidents',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './incidents.html',
  styleUrl: './incidents.css',
})
export class Incidents implements OnInit {
  incidents: IncidentView[] = [];
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  editing: Incident = this.empty();
  showForm = false;
  today = new Date().toISOString().slice(0, 10);

  constructor(
    private incidentService: IncidentService,
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.load();
    this.vehicles = this.vehicleService.getVehicles();
    this.drivers = this.driverService.getDrivers();
  }

  load(): void {
    this.incidents = this.incidentService.getIncidentView();
  }

  empty(): Incident {
    return {
      id: '',
      vehicleId: '',
      driverId: '',
      date: this.today,
      location: '',
      description: '',
      damage: '',
      policeReportNumber: '',
      insuranceClaimNumber: '',
      repairCost: 0,
      status: 'open',
      images: [],
    };
  }

  addNew(): void {
    this.editing = this.empty();
    this.showForm = true;
  }

  edit(incident: IncidentView): void {
    this.editing = { ...incident, images: incident.images ?? [] };
    this.showForm = true;
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!this.editing.images) {
          this.editing.images = [];
        }
        this.editing.images = [...this.editing.images, result];
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removeImage(index: number): void {
    if (!this.editing.images) return;
    this.editing.images = this.editing.images.filter((_, i) => i !== index);
  }

  cancel(): void {
    this.showForm = false;
    this.editing = this.empty();
  }

  save(): void {
    if (!this.editing.vehicleId || !this.editing.driverId || !this.editing.date) return;
    if (!this.editing.id) {
      this.editing.id = this.incidentService.generateId();
    }
    this.incidentService.saveIncident(this.editing);
    this.showForm = false;
    this.editing = this.empty();
    this.load();
  }

  delete(id: string): void {
    if (confirm('Delete this incident record?')) {
      this.incidentService.deleteIncident(id);
      this.load();
    }
  }
}
