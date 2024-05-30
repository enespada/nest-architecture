import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TopUp } from './dto/top-up.dto';
import { join } from 'path';
import { create } from 'html-pdf';
import { HandlebarsService } from '../handlebars/handlebars.service';

@Injectable()
export class PdfService {
  constructor(private handlebarsService: HandlebarsService) {}

  generateBill(topUp: Partial<TopUp>): Observable<Buffer> {
    return new Observable((subs) => {
      create(
        this.handlebarsService.renderTemplate(
          join(__dirname, `templates/simplified-invoice/html.handlebars`),
          topUp,
        ),
      ).toBuffer(function (err, buffer) {
        err ? subs.error(err) : subs.next(buffer);
        return subs.complete();
      });
    });
  }
}
