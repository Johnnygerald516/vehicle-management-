import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VehicleDocument, DocumentView, DocumentType, AlertStatus } from '../models/vehicle-document';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { DocumentService } from '../services/document';
import { VehicleService } from '../services/vehicle';
import { DriverService } from '../services/driver';

interface AlertItem {
  subject: string;
  type: string;
  expiryDate: string;
  status: AlertStatus;
}

@Component({
  selector: 'app-documents',
  imports: [FormsModule, RouterLink],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {
  documents: DocumentView[] = [];
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  alerts: AlertItem[] = [];
  editing: VehicleDocument = this.empty();
  showForm = false;
  today = new Date().toISOString().slice(0, 10);

  readonly types: { value: DocumentType; label: string }[] = [
    { value: 'insurance', label: 'Insurance' },
    { value: 'road_license', label: 'Road Licence' },
    { value: 'driver_license', label: 'Driver Licence' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'scheduled_service', label: 'Scheduled Service' },
    { value: 'other', label: 'Other' },
  ];

  constructor(
    private documentService: DocumentService,
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.vehicles = this.vehicleService.getVehicles();
    this.drivers = this.driverService.getDrivers();
    this.load();
  }

  load(): void {
    this.documents = this.documentService.getDocumentView();
    this.alerts = this.buildAlerts();
  }

  empty(): VehicleDocument {
    return {
      id: '',
      vehicleId: '',
      driverId: '',
      type: 'insurance',
      referenceNumber: '',
      issueDate: '',
      expiryDate: '',
      notes: '',
    };
  }

  private soon(): string {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }

  status(expiryDate: string): AlertStatus {
    if (!expiryDate) return 'valid';
    if (expiryDate < this.today) return 'expired';
    if (expiryDate <= this.soon()) return 'due_soon';
    return 'valid';
  }

  private buildAlerts(): AlertItem[] {
    const items: AlertItem[] = [];
    for (const v of this.vehicles) {
      const name = `${v.year} ${v.make} ${v.model} (${v.licensePlate})`;
      const checks: [string, string | undefined][] = [
        ['Insurance', v.insuranceExpiry],
        ['Road Licence', v.roadLicenseExpiry],
        ['Inspection', v.inspectionExpiry],
        ['Scheduled Service', v.nextServiceDue],
      ];
      for (const [type, date] of checks) {
        if (date) {
          items.push({ subject: name, type, expiryDate: date, status: this.status(date) });
        }
      }
    }
    for (const d of this.drivers) {
      if (d.licenseExpiryDate) {
        items.push({
          subject: d.name,
          type: 'Driver Licence',
          expiryDate: d.licenseExpiryDate,
          status: this.status(d.licenseExpiryDate),
        });
      }
    }
    for (const doc of this.documents) {
      items.push({
        subject: doc.subjectName,
        type: this.typeLabel(doc.type),
        expiryDate: doc.expiryDate,
        status: this.status(doc.expiryDate),
      });
    }
    return items.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  }

  typeLabel(type: DocumentType): string {
    return this.types.find(t => t.value === type)?.label ?? type;
  }

  expiredCount(): number {
    return this.alerts.filter(a => a.status === 'expired').length;
  }

  dueSoonCount(): number {
    return this.alerts.filter(a => a.status === 'due_soon').length;
  }

  validCount(): number {
    return this.alerts.filter(a => a.status === 'valid').length;
  }

  addNew(): void {
    this.editing = this.empty();
    this.showForm = true;
  }

  edit(d: DocumentView): void {
    this.editing = {
      id: d.id,
      vehicleId: d.vehicleId,
      driverId: d.driverId,
      type: d.type,
      referenceNumber: d.referenceNumber,
      issueDate: d.issueDate,
      expiryDate: d.expiryDate,
      notes: d.notes,
    };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = this.empty();
  }

  save(): void {
    if (!this.editing.expiryDate || (!this.editing.vehicleId && !this.editing.driverId)) return;
    if (!this.editing.vehicleId) delete this.editing.vehicleId;
    if (!this.editing.driverId) delete this.editing.driverId;
    if (!this.editing.id) {
      this.editing.id = this.documentService.generateId();
    }
    this.documentService.saveDocument(this.editing);
    this.showForm = false;
    this.editing = this.empty();
    this.load();
  }

  delete(id: string): void {
    if (confirm('Delete this document?')) {
      this.documentService.deleteDocument(id);
      this.load();
    }
  }
}
