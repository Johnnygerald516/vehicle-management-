import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Vehicle } from '../models/vehicle';
import { ServiceRecord } from '../models/service-record';
import { MaintenanceRequest } from '../models/maintenance-request';
import { WorkOrder } from '../models/work-order';
import { VehicleService } from '../services/vehicle';
import { ServiceRecordService } from '../services/service-record';
import { MaintenanceService, RequestView, WorkOrderView } from '../services/maintenance';

type Tab = 'service' | 'history' | 'schedule';

@Component({
  selector: 'app-maintenance',
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css',
})
export class Maintenance implements OnInit {
  activeTab: Tab = 'service';
  vehicles: Vehicle[] = [];
  records: ServiceRecord[] = [];
  requests: RequestView[] = [];
  workOrders: WorkOrderView[] = [];
  today = new Date().toISOString().slice(0, 10);

  newRequest: MaintenanceRequest = this.emptyRequest();
  newWorkOrder: WorkOrder = this.emptyWorkOrder();
  newRecord: ServiceRecord = this.emptyRecord();
  showRequestForm = false;
  showWorkOrderForm = false;
  showRecordForm = false;

  constructor(
    private vehicleService: VehicleService,
    private recordService: ServiceRecordService,
    private maintenanceService: MaintenanceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.vehicles = this.vehicleService.getVehicles();
    this.records = this.recordService.getRecords();
    this.loadRequests();
    this.loadWorkOrders();
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as Tab;
      if (tab && ['service', 'history', 'schedule'].includes(tab)) {
        this.activeTab = tab;
      } else {
        this.activeTab = 'service';
      }
    });
  }

  loadRequests(): void {
    this.requests = this.maintenanceService.getRequestView();
  }

  loadWorkOrders(): void {
    this.workOrders = this.maintenanceService.getWorkOrderView();
  }

  emptyRequest(): MaintenanceRequest {
    return {
      id: '',
      vehicleId: '',
      currentMileage: 0,
      problem: '',
      requestedBy: '',
      priority: 'medium',
      status: 'pending',
      requestDate: this.today,
    };
  }

  emptyRecord(): ServiceRecord {
    return {
      id: '',
      vehicleId: '',
      serviceDate: this.today,
      mileage: 0,
      serviceType: '',
      description: '',
      technician: '',
      garage: '',
      parts: '',
      labourCost: 0,
      otherCost: 0,
      cost: 0,
      nextServiceDate: '',
      nextServiceMileage: 0,
      status: 'completed',
    };
  }

  emptyWorkOrder(): WorkOrder {
    return {
      id: '',
      requestId: '',
      vehicleId: '',
      maintenanceType: '',
      tasks: '',
      mechanic: '',
      expectedCompletion: '',
      actualCompletion: '',
      parts: '',
      cost: 0,
      status: 'open',
    };
  }

  soonDate(): string {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return soon.toISOString().slice(0, 10);
  }

  overdue(): Vehicle[] {
    return this.vehicles.filter(v => v.status === 'active' && v.nextServiceDue < this.today);
  }

  upcoming(): Vehicle[] {
    const soon = this.soonDate();
    return this.vehicles.filter(
      v => v.status === 'active' && v.nextServiceDue >= this.today && v.nextServiceDue <= soon
    );
  }

  vehicleName(id: string): string {
    const v = this.vehicles.find(x => x.id === id);
    return v ? `${v.year} ${v.make} ${v.model}` : id;
  }

  totalCost(): number {
    return this.records.reduce((sum, r) => sum + (r.cost || 0), 0);
  }

  setTab(tab: Tab): void {
    this.router.navigate(['/maintenance'], { queryParams: { tab } });
    this.showRequestForm = false;
    this.showWorkOrderForm = false;
    this.showRecordForm = false;
  }

  addRecord(): void {
    this.newRecord = this.emptyRecord();
    this.showRecordForm = true;
  }

  cancelRecord(): void {
    this.showRecordForm = false;
    this.newRecord = this.emptyRecord();
  }

  saveRecord(): void {
    if (!this.newRecord.vehicleId || !this.newRecord.serviceDate || !this.newRecord.serviceType) return;
    this.newRecord.id = this.recordService.generateId();
    this.newRecord.status = 'completed';
    this.recordService.addRecord({ ...this.newRecord });
    this.showRecordForm = false;
    this.newRecord = this.emptyRecord();
    this.records = this.recordService.getRecords();
    this.vehicles = this.vehicleService.getVehicles();
  }

  deleteRecord(id: string): void {
    if (confirm('Delete this service record?')) {
      this.recordService.deleteRecord(id);
      this.records = this.recordService.getRecords();
    }
  }

  addRequest(): void {
    this.newRequest = this.emptyRequest();
    this.showRequestForm = true;
  }

  editRequest(r: RequestView): void {
    this.newRequest = {
      id: r.id,
      vehicleId: r.vehicleId,
      currentMileage: r.currentMileage,
      problem: r.problem,
      requestedBy: r.requestedBy,
      priority: r.priority,
      status: r.status,
      requestDate: r.requestDate,
    };
    this.showRequestForm = true;
  }

  cancelRequest(): void {
    this.showRequestForm = false;
    this.newRequest = this.emptyRequest();
  }

  saveRequest(): void {
    if (!this.newRequest.id) {
      this.newRequest.id = this.maintenanceService.generateId();
    }
    this.maintenanceService.saveRequest(this.newRequest);
    this.showRequestForm = false;
    this.newRequest = this.emptyRequest();
    this.loadRequests();
  }

  deleteRequest(id: string): void {
    if (confirm('Delete this maintenance request?')) {
      this.maintenanceService.deleteRequest(id);
      this.loadRequests();
    }
  }

  addWorkOrder(): void {
    this.newWorkOrder = this.emptyWorkOrder();
    this.showWorkOrderForm = true;
  }

  editWorkOrder(w: WorkOrderView): void {
    this.newWorkOrder = {
      id: w.id,
      requestId: w.requestId,
      vehicleId: w.vehicleId,
      maintenanceType: w.maintenanceType,
      tasks: w.tasks,
      mechanic: w.mechanic,
      expectedCompletion: w.expectedCompletion,
      actualCompletion: w.actualCompletion || '',
      parts: w.parts,
      cost: w.cost,
      status: w.status,
    };
    this.showWorkOrderForm = true;
  }

  cancelWorkOrder(): void {
    this.showWorkOrderForm = false;
    this.newWorkOrder = this.emptyWorkOrder();
  }

  saveWorkOrder(): void {
    if (!this.newWorkOrder.id) {
      this.newWorkOrder.id = this.maintenanceService.generateId();
    }
    this.maintenanceService.saveWorkOrder(this.newWorkOrder);
    this.showWorkOrderForm = false;
    this.newWorkOrder = this.emptyWorkOrder();
    this.loadWorkOrders();
  }

  deleteWorkOrder(id: string): void {
    if (confirm('Delete this work order?')) {
      this.maintenanceService.deleteWorkOrder(id);
      this.loadWorkOrders();
    }
  }

  completeWorkOrder(w: WorkOrderView): void {
    const updated: WorkOrder = {
      ...w,
      status: 'completed',
      actualCompletion: this.today,
    };
    this.maintenanceService.saveWorkOrder(updated);

    const vehicle = this.vehicles.find(v => v.id === w.vehicleId);
    const serviceMileage = vehicle ? vehicle.mileage : 0;
    const nextMileage = serviceMileage ? serviceMileage + 10000 : undefined;
    const nextDate = vehicle ? vehicle.nextServiceDue : undefined;

    this.recordService.addRecord({
      id: this.recordService.generateId(),
      vehicleId: w.vehicleId,
      workOrderId: w.id,
      serviceNumber: 'SH-' + w.id.slice(-6).toUpperCase(),
      serviceDate: this.today,
      mileage: serviceMileage,
      serviceType: w.maintenanceType,
      description: w.tasks,
      technician: w.mechanic,
      parts: w.parts,
      labourCost: 0,
      otherCost: 0,
      cost: w.cost,
      nextServiceMileage: nextMileage,
      nextServiceDate: nextDate,
      status: 'completed',
    });

    this.loadWorkOrders();
    this.records = this.recordService.getRecords();
  }

  approveWorkOrder(w: WorkOrderView): void {
    const updated: WorkOrder = { ...w, status: 'approved' };
    this.maintenanceService.saveWorkOrder(updated);
    this.loadWorkOrders();
  }
}
