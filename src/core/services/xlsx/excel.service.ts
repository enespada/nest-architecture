import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Workbook } from 'exceljs';
import { from, of } from 'rxjs';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import { WorkSheetDataDto } from './dto/worksheet-data.dto';

@Injectable()
export class ExcelService {
  constructor(private config: ConfigService) {}

  createWorkBook(workSheets: Array<WorkSheetDataDto>) {
    const workbook = new Workbook();

    workSheets.forEach((ws) => {
      const sheet = workbook.addWorksheet(ws.pageName);
      sheet.columns = ws.columns;
      ws.values && ws.values.forEach((v) => sheet.addRow(v));
    });

    return workbook;
  }

  buffer(workbook: Workbook) {
    return from(workbook.xlsx.writeBuffer());
  }

  readFile(buffer: Buffer) {
    const workbook = new Workbook();
    return from(workbook.xlsx.load(buffer));
  }

  readStream(buffer: Buffer) {
    // const workbook = new Workbook();
    XLSX.stream.set_readable(Readable);

    const workbook = XLSX.read(buffer);

    return of(workbook);
  }
}
