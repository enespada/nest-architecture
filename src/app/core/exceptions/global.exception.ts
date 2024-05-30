import { ResponseError } from '@core/response/error.response';
import { CustomLoggerService } from '@core/services/logger/logger.service';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  public catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    this.handleError(exception, request, response);
  }

  public handleError(exception: unknown, request: Request, response: Response) {
    const error = new ResponseError().fromError(exception);
    this.logger.error(error.toLog(request.originalUrl));
    response.status(error.status).send(error.toJson());
  }
}
