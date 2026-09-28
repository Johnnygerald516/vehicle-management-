import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from '../services/vehicle';
import { FuelService } from '../services/fuel';
import { ServiceRecordService } from '../services/service-record';
import { IncidentService } from '../services/incident';

interface SearchCriteria {
  keyword: string;
  status: string;
  department: string;
  ownership: string;
}

@Component({
  selector: 'app-reports',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  vehicles: Vehicle[] = [];

  keyword = '';
  status = '';
  department = '';
  ownership = '';

  applied: SearchCriteria = {
    keyword: '',
    status: '',
    department: '',
    ownership: '',
  };

  constructor(
    private vehicleService: VehicleService,
    private fuelService: FuelService,
    private recordService: ServiceRecordService,
    private incidentService: IncidentService
  ) {}

  ngOnInit(): void {
    this.vehicles = this.vehicleService.getVehicles();
    this.applyFilters();
  }

  uniqueDepartments(): string[] {
    return [...new Set(this.vehicles.map(v => v.department).filter(Boolean))] as string[];
  }

  uniqueOwnerships(): string[] {
    return [...new Set(this.vehicles.map(v => v.ownership).filter(Boolean))] as string[];
  }

  applyFilters(): void {
    this.applied = {
      keyword: this.keyword,
      status: this.status,
      department: this.department,
      ownership: this.ownership,
    };
  }

  filtered(): Vehicle[] {
    return this.vehicles.filter(v => {
      const k = this.applied.keyword.toLowerCase();
      const matchesKeyword = !k ||
        v.vehicleId.toLowerCase().includes(k) ||
        v.make.toLowerCase().includes(k) ||
        v.model.toLowerCase().includes(k) ||
        v.licensePlate.toLowerCase().includes(k) ||
        (v.department?.toLowerCase().includes(k) ?? false) ||
        (v.vin?.toLowerCase().includes(k) ?? false);
      const matchesStatus = !this.applied.status || v.status === this.applied.status;
      const matchesDept = !this.applied.department || v.department === this.applied.department;
      const matchesOwnership = !this.applied.ownership || v.ownership === this.applied.ownership;
      return matchesKeyword && matchesStatus && matchesDept && matchesOwnership;
    });
  }

  fuelCost(v: Vehicle): number {
    return this.fuelService.getTotalCost(v.id);
  }

  serviceCost(v: Vehicle): number {
    return this.recordService.getRecords(v.id).reduce((s, r) => s + (r.cost || 0), 0);
  }

  incidentCost(v: Vehicle): number {
    return this.incidentService.getIncidents()
      .filter(i => i.vehicleId === v.id)
      .reduce((s, i) => s + (i.repairCost || 0), 0);
  }

  totalCost(v: Vehicle): number {
    return this.fuelCost(v) + this.serviceCost(v) + this.incidentCost(v);
  }

  reset(): void {
    this.keyword = '';
    this.status = '';
    this.department = '';
    this.ownership = '';
    this.applyFilters();
  }
}
