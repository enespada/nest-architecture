export interface TopUp {
  total: number;
  basePrice: number;
  iva: number;
  units: number;
  subtotal: number;
  order: string;
  createdAt: string;
  schoolYear: string;
  centerName: string;
  town: string;
  managerName: string;
  nif: string;
  managerEmail: string;
  students: Array<string>;
  bottomPixels: number;
  host: string;
}
