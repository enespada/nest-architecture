import { CustomLoggerService } from '@core/services/logger/logger.service';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(private logger: CustomLoggerService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl } = request;
    const requestTimestamp = Date.now();
    this.logger.context = 'APP';
    this.logger.request(`${method} :: ${originalUrl}`);

    response.on('close', () => {
      const { statusCode } = response;

      this.logger.context = 'APP';
      this.logger.response(
        `${method} :: ${originalUrl} :: ${statusCode}`,
        `+${Date.now() - requestTimestamp}ms`,
      );
    });

    next();
  }
}
