import { Column } from 'exceljs';

export interface WorkSheetDataDto {
  pageName: string;
  columns: Partial<Column>[];
  values?: Array<Array<any>>;
}
