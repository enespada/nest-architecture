import { Column } from 'exceljs';

export interface ExcelDataDto {
  key: string;
  header: Partial<Column>;
  example: any;
}
