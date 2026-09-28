import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Assignment, AssignmentView } from '../models/assignment';
import { Vehicle } from '../models/vehicle';
import { Driver } from '../models/driver';
import { AssignmentService } from '../services/assignment';
import { VehicleService } from '../services/vehicle';
import { DriverService } from '../services/driver';

@Component({
  selector: 'app-assignments',
  imports: [FormsModule, RouterLink],
  templateUrl: './assignments.html',
  styleUrl: './assignments.css',
})
export class Assignments implements OnInit {
  assignments: AssignmentView[] = [];
  vehicles: Vehicle[] = [];
  drivers: Driver[] = [];
  editing: Assignment = this.empty();
  showForm = false;

  constructor(
    private assignmentService: AssignmentService,
    private vehicleService: VehicleService,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.vehicles = this.vehicleService.getVehicles();
    this.drivers = this.driverService.getDrivers();
    this.load();
  }

  load(): void {
    this.assignments = this.assignmentService.getAssignmentView();
  }

  empty(): Assignment {
    return {
      id: '',
      vehicleId: '',
      driverId: '',
      department: '',
      purpose: '',
      route: '',
      startDate: '',
      endDate: '',
      departureTime: '',
      returnTime: '',
      startOdometer: 0,
      endOdometer: 0,
      status: 'pending',
    };
  }

  addNew(): void {
    this.editing = this.empty();
    this.showForm = true;
  }

  edit(a: AssignmentView): void {
    this.editing = {
      id: a.id,
      vehicleId: a.vehicleId,
      driverId: a.driverId,
      department: a.department,
      purpose: a.purpose,
      route: a.route,
      startDate: a.startDate,
      endDate: a.endDate,
      departureTime: a.departureTime,
      returnTime: a.returnTime,
      startOdometer: a.startOdometer,
      endOdometer: a.endOdometer,
      status: a.status,
    };
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.editing = this.empty();
  }

  save(): void {
    if (!this.editing.id) {
      this.editing.id = this.assignmentService.generateId();
    }
    this.assignmentService.saveAssignment(this.editing);
    this.showForm = false;
    this.editing = this.empty();
    this.load();
  }

  updateStatus(a: AssignmentView, status: Assignment['status']): void {
    this.assignmentService.saveAssignment({ ...a, status });
    this.load();
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this assignment?')) {
      this.assignmentService.deleteAssignment(id);
      this.load();
    }
  }
}
