import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';

@Injectable()
export class HandlebarsService {
  renderTemplate(path: string, params?: Record<string, any>) {
    const compiledTemplate = handlebars.compile(readFileSync(path, 'utf8'));

    return compiledTemplate(params);
  }
}
