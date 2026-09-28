export type ExpenseCategory =
  | 'fuel'
  | 'service'
  | 'repair'
  | 'insurance'
  | 'tyres'
  | 'parking'
  | 'fines'
  | 'other';

export interface Expense {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  date: string;
  amount: number;
  description: string;
  vendor?: string;
}

export interface ExpenseView extends Expense {
  vehicleName: string;
}
