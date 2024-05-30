import { PageDto } from '@core/database/dto/page.dto';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response {
  statusCode: number;
  data: Array<any>;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor<any, Response> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    return next.handle().pipe(
      map((rawData) => {
        let data;
        if (this.instanceOfEntityQueryResponse(rawData)) {
          data = (rawData as PageDto<any>).data;
        } else data = Array.isArray(rawData) ? rawData : [rawData];

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data: data.filter((i) => i),
          meta: rawData.meta,
        };
      }),
    );
  }

  private instanceOfEntityQueryResponse(object: any): object is PageDto<any> {
    return 'meta' in object && 'data' in object;
  }
}
