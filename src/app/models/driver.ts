export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  licenseCategory: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  employeeId: string;
  address: string;
  emergencyContact: string;
  status: 'active' | 'inactive';
}
