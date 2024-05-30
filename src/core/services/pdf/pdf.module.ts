import { Module } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import { HandlebarsModule } from '../handlebars/handlebars.module';

@Module({
  imports: [HandlebarsModule],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
