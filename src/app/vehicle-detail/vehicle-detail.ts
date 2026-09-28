import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Vehicle } from '../models/vehicle';
import { ServiceRecord } from '../models/service-record';
import { VehicleService } from '../services/vehicle';
import { ServiceRecordService } from '../services/service-record';

@Component({
  selector: 'app-vehicle-detail',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
})
export class VehicleDetail implements OnInit {
  vehicle: Vehicle | undefined;
  records: ServiceRecord[] = [];
  newRecord: ServiceRecord = this.emptyRecord();
  selectedRecord: ServiceRecord | undefined;
  today = new Date().toISOString().slice(0, 10);

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private recordService: ServiceRecordService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.vehicle = this.vehicleService.getVehicleById(id);
    this.loadRecords(id);
  }

  loadRecords(vehicleId: string): void {
    this.records = this.recordService.getRecords(vehicleId);
  }

  emptyRecord(): ServiceRecord {
    return {
      id: '',
      vehicleId: '',
      serviceDate: new Date().toISOString().slice(0, 10),
      mileage: 0,
      serviceType: '',
      description: '',
      technician: '',
      parts: '',
      labourCost: 0,
      otherCost: 0,
      cost: 0,
      status: 'completed',
    };
  }

  soonDate(): string {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return soon.toISOString().slice(0, 10);
  }

  addRecord(): void {
    if (!this.vehicle) return;
    const vehicleId = this.vehicle.id;
    this.newRecord.id = this.recordService.generateId();
    this.newRecord.vehicleId = vehicleId;
    this.recordService.addRecord(this.newRecord);
    this.vehicle = this.vehicleService.getVehicleById(vehicleId);
    this.loadRecords(vehicleId);
    this.newRecord = this.emptyRecord();
  }

  viewRecord(record: ServiceRecord): void {
    this.selectedRecord = record;
  }

  closeDetail(): void {
    this.selectedRecord = undefined;
  }

  deleteRecord(id: string): void {
    this.recordService.deleteRecord(id);
    if (this.vehicle) {
      this.loadRecords(this.vehicle.id);
    }
  }
}
