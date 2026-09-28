import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from '../services/vehicle';

@Component({
  selector: 'app-vehicles',
  imports: [FormsModule, RouterLink],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class Vehicles implements OnInit {
  vehicles: Vehicle[] = [];
  editingVehicle: Vehicle = this.emptyVehicle();
  showForm = false;
  today = new Date().toISOString().slice(0, 10);

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.vehicles = this.vehicleService.getVehicles();
  }

  soonDate(): string {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return soon.toISOString().slice(0, 10);
  }

  emptyVehicle(): Vehicle {
    return {
      id: '',
      vehicleId: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
      engineNumber: '',
      ownership: '',
      department: '',
      insuranceExpiry: '',
      roadLicenseExpiry: '',
      inspectionExpiry: '',
      documents: [],
      fuelType: '',
      fuelTankCapacity: 0,
      mileage: 0,
      nextServiceMileage: 0,
      lastServiceDate: '',
      nextServiceDue: '',
      status: 'active',
    };
  }

  addNew(): void {
    this.editingVehicle = this.emptyVehicle();
    this.showForm = true;
  }

  edit(vehicle: Vehicle): void {
    this.editingVehicle = { ...vehicle };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editingVehicle = this.emptyVehicle();
  }

  save(): void {
    if (!this.editingVehicle.id) {
      this.editingVehicle.id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    this.vehicleService.saveVehicle(this.editingVehicle);
    this.showForm = false;
    this.editingVehicle = this.emptyVehicle();
    this.load();
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(id);
      this.load();
    }
  }

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const names = Array.from(input.files).map(f => f.name);
    this.editingVehicle.documents = [...(this.editingVehicle.documents ?? []), ...names];
    input.value = '';
  }

  removeDocument(index: number): void {
    this.editingVehicle.documents = (this.editingVehicle.documents ?? []).filter((_, i) => i !== index);
  }
}
