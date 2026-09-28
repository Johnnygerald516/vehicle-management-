import { Injectable } from '@angular/core';
import { MaintenanceRequest } from '../models/maintenance-request';
import { WorkOrder } from '../models/work-order';
import { Vehicle } from '../models/vehicle';
import { VehicleService } from './vehicle';

export interface RequestView extends MaintenanceRequest {
  vehicleName: string;
}

export interface WorkOrderView extends WorkOrder {
  vehicleName: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private readonly requestsKey = 'car-service.maintenance-requests';
  private readonly workOrdersKey = 'car-service.work-orders';

  constructor(private vehicleService: VehicleService) {}

  getRequests(): MaintenanceRequest[] {
    const raw = localStorage.getItem(this.requestsKey);
    return raw ? (JSON.parse(raw) as MaintenanceRequest[]) : [];
  }

  getRequestView(): RequestView[] {
    const requests = this.getRequests();
    const vehicles = this.vehicleService.getVehicles();
    const vMap = new Map<string, Vehicle>();
    vehicles.forEach(v => vMap.set(v.id, v));

    return requests.map(r => ({
      ...r,
      vehicleName: this.vehicleName(vMap.get(r.vehicleId)),
    }));
  }

  saveRequest(request: MaintenanceRequest): void {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      requests[index] = request;
    } else {
      requests.push(request);
    }
    localStorage.setItem(this.requestsKey, JSON.stringify(requests));
  }

  deleteRequest(id: string): void {
    const requests = this.getRequests().filter(r => r.id !== id);
    localStorage.setItem(this.requestsKey, JSON.stringify(requests));
  }

  getWorkOrders(): WorkOrder[] {
    const raw = localStorage.getItem(this.workOrdersKey);
    return raw ? (JSON.parse(raw) as WorkOrder[]) : [];
  }

  getWorkOrderView(): WorkOrderView[] {
    const workOrders = this.getWorkOrders();
    const vehicles = this.vehicleService.getVehicles();
    const vMap = new Map<string, Vehicle>();
    vehicles.forEach(v => vMap.set(v.id, v));

    return workOrders.map(w => ({
      ...w,
      vehicleName: this.vehicleName(vMap.get(w.vehicleId)),
    }));
  }

  saveWorkOrder(workOrder: WorkOrder): void {
    const workOrders = this.getWorkOrders();
    const index = workOrders.findIndex(w => w.id === workOrder.id);
    if (index >= 0) {
      workOrders[index] = workOrder;
    } else {
      workOrders.push(workOrder);
    }
    localStorage.setItem(this.workOrdersKey, JSON.stringify(workOrders));
  }

  deleteWorkOrder(id: string): void {
    const workOrders = this.getWorkOrders().filter(w => w.id !== id);
    localStorage.setItem(this.workOrdersKey, JSON.stringify(workOrders));
  }

  private vehicleName(v: Vehicle | undefined): string {
    return v ? `${v.year} ${v.make} ${v.model}` : 'Unknown Vehicle';
  }

  generateId(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
